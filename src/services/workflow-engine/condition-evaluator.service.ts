import type {
  ComparisonOperator,
  ConditionConfig,
  ExecutionContext,
  LogicalOperator,
} from '@/features/flow/flow.interfaces'

export const ConditionEvaluator = {
  evaluate(condition: ConditionConfig, context: ExecutionContext): boolean {
    if (!condition.conditions || condition.conditions.length === 0) {
      return true
    }

    const results = condition.conditions.map((c) =>
      this.evaluateExpression(c.field, c.operator, c.value, context)
    )

    return this.combineConditions(results, condition.logicalOperator)
  },

  evaluateExpression(
    field: string,
    operator: ComparisonOperator,
    value: any,
    context: ExecutionContext
  ): boolean {
    // Obter valor do campo
    const fieldValue = this.getFieldValue(field, context)

    // Comparar valores
    switch (operator) {
      case '<':
        return fieldValue < value
      case '>':
        return fieldValue > value
      case '==':
        return this.deepEqual(fieldValue, value)
      case '<=':
        return fieldValue <= value
      case '>=':
        return fieldValue >= value
      case '!=':
        return !this.deepEqual(fieldValue, value)
      default:
        return false
    }
  },

  combineConditions(results: boolean[], logicalOperator: LogicalOperator): boolean {
    if (results.length === 0) {
      return true
    }

    if (logicalOperator === 'AND') {
      return results.every((r) => r === true)
    }
    if (logicalOperator === 'OR') {
      return results.some((r) => r === true)
    }

    return false
  },

  getFieldValue(field: string, context: ExecutionContext): any {
    const fieldMap: Record<string, any> = {
      stock_quantity: context.product?.stock || 0,
      movement_value: context.movement?.quantity || 0,
      movement_type: context.movement?.type || '',
      stock_percentage: this.calculateStockPercentage(context),
    }

    // Se for um campo direto
    if (fieldMap[field] !== undefined) {
      return fieldMap[field]
    }

    // Tentar acesso direto no contexto
    const parts = field.split('.')
    let current: any = context

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return null
      }
    }

    return current
  },

  calculateStockPercentage(context: ExecutionContext): number {
    if (!context.product) {
      return 0
    }

    // Assumindo que product tem stockMin e stockMax
    const stock = context.product.stock || 0
    const stockMin = (context.product as any).stockMin || 0
    const stockMax = (context.product as any).stockMax || 1

    if (stockMax === 0) {
      return 0
    }

    return ((stock - stockMin) / (stockMax - stockMin)) * 100
  },

  deepEqual(a: any, b: any): boolean {
    if (a === b) {
      return true
    }

    if (a == null || b == null) {
      return false
    }

    if (typeof a !== typeof b) {
      return false
    }

    if (typeof a === 'object') {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], b[i])) {
            return false
          }
        }
        return true
      }

      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      if (keysA.length !== keysB.length) {
        return false
      }

      for (const key of keysA) {
        if (!(key in b)) {
          return false
        }
        if (!this.deepEqual(a[key], b[key])) {
          return false
        }
      }

      return true
    }

    return false
  },
}
