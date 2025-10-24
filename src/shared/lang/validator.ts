import type { LangiumCoreServices, ValidationAcceptor, ValidationChecks } from 'langium';

import type { fraudRulesAstType, Predicate } from './generated/ast.js';

export class FraudRulesValidator {
  /** Регистрация кастомных проверок */
  register(services: LangiumCoreServices) {
    const checks: ValidationChecks<fraudRulesAstType> = {
      Predicate: this.checkPredicate,
    };
    services.validation.ValidationRegistry.register(checks, this);
  }

  private checkPredicate(pred: Predicate, accept: ValidationAcceptor): void {
    const name = pred.name ?? '';
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      accept('error', 'Имя переменной должно быть в UPPER_SNAKE_CASE', {
        node: pred,
        property: 'name',
      });
    }

    // BETWEEN?
    const isBetween = pred.a !== undefined && pred.b !== undefined;
    if (isBetween) {
      const a = String(pred.a ?? '');
      const b = String(pred.b ?? '');
      const ta = valueType(a);
      const tb = valueType(b);
      if (ta !== tb) {
        accept('error', 'BETWEEN требует значения одного типа (оба число или оба время).', {
          node: pred,
        });
      }
      return;
    }

    // Обычное сравнение
    const op = (pred.op ?? '').trim();
    const val = String(pred.value ?? '');
    if (!op) {
      accept('error', 'Ожидался оператор сравнения (>=, >, <=, <, =) или BETWEEN.', { node: pred });
    } else if (!val) {
      accept('error', 'Ожидалось значение для оператора сравнения.', { node: pred });
    }
  }
}

function valueType(s: string): 'time' | 'float' {
  return /^\d{2}:\d{2}:\d{2}$/.test(s) ? 'time' : 'float';
}
