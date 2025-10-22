import { DiagnosticSeverity, type Diagnostic as VsDiagnostic } from 'vscode-languageserver-types';

import { parseText } from './fraud-services';
import type { Model } from './generated/ast.js';
import { collectSemanticDiagnostics } from './semantic';
import { modelToJson } from './transform';

export type Diagnostic = {
  message: string;
  from: number;
  to: number;
  severity: 'error' | 'warning' | 'info';
};

function hasUnfinishedTail(text: string): string | null {
  const t = text.trimEnd();
  if (!t) {
    return 'Пустое правило.';
  }
  if (/[><=]\s*$/.test(t)) {
    return 'Ожидалось значение после оператора сравнения.';
  }
  if (/\bNOT\s*$/.test(t)) {
    return 'После NOT ожидается BETWEEN.';
  }
  if (/\b(NOT\s+)?BETWEEN\s*$/.test(t)) {
    return 'После BETWEEN ожидается [a, b].';
  }
  if (/\[\s*$/.test(t)) {
    return 'Квадратная скобка не закрыта.';
  }
  if (/\[\s*[^,\]]*$/.test(t)) {
    return 'После первого значения в [...] ожидается запятая.';
  }
  if (/\[\s*[^,\]]*,\s*$/.test(t)) {
    return 'Ожидается второе значение в [...].';
  }
  return null;
}
function balanceError(text: string): string | null {
  const paren = (text.match(/\(/g) || []).length - (text.match(/\)/g) || []).length;
  if (paren !== 0) {
    return 'Круглые скобки не сбалансированы.';
  }
  const brack = (text.match(/\[/g) || []).length - (text.match(/\]/g) || []).length;
  if (brack !== 0) {
    return 'Квадратные скобки не сбалансированы.';
  }
  return null;
}

function toUiDiags(text: string, arr: readonly VsDiagnostic[]): Diagnostic[] {
  return arr.map((d) => {
    const from = d.range ? char(text, d.range.start) : 0;
    const to = d.range ? char(text, d.range.end) : Math.max(from + 1, from);
    const severity =
      d.severity === DiagnosticSeverity.Error
        ? 'error'
        : d.severity === DiagnosticSeverity.Warning
          ? 'warning'
          : 'info';
    return { message: d.message, from, to, severity };
  });
  function char(src: string, pos: { line: number; character: number }) {
    // у нас однострочный ввод — мапим character как offset
    return Math.min(Math.max(pos.character, 0), src.length);
  }
}

/** Собирает ВСЕ ошибки (эвристики + Langium + наша семантика) с позициями */
export async function validateAll(text: string): Promise<Diagnostic[]> {
  const extra: Diagnostic[] = [];
  const t1 = hasUnfinishedTail(text);
  const t2 = balanceError(text);
  for (const m of [t1, t2].filter(Boolean) as string[]) {
    extra.push({
      message: m,
      from: Math.max(0, text.length - 1),
      to: text.length,
      severity: 'error',
    });
  }

  const doc = await parseText(text);
  const model = doc.parseResult.value as Model;

  const lsp = toUiDiags(
    text,
    (doc.diagnostics ?? []).filter((d) => d.severity === DiagnosticSeverity.Error),
  );
  const sem = toUiDiags(text, collectSemanticDiagnostics(model, text));

  return [...extra, ...lsp, ...sem];
}

/** One-shot: проверяем expression(+exclusion) и либо возвращаем ошибки, либо JSON */
export async function buildRules(
  expression: string,
  exclusion?: string,
): Promise<{ ok: true; json: unknown } | { ok: false; errors: Diagnostic[] }> {
  const exprErrs = await validateAll(expression);
  let exclErrs: Diagnostic[] = [];
  if (exclusion?.trim()) {
    exclErrs = await validateAll(exclusion);
  }
  const allErrs = [...exprErrs, ...exclErrs];
  if (allErrs.length) {
    return { ok: false, errors: allErrs };
  }

  // ок — трансформируем
  const exprDoc = await parseText(expression);
  const exprJson = modelToJson(exprDoc.parseResult.value as Model).expression;

  let exclJson: unknown[] = [];
  if (exclusion?.trim()) {
    const exclDoc = await parseText(exclusion);
    exclJson = modelToJson(exclDoc.parseResult.value as Model).expression;
  }
  return { ok: true, json: { rules: [{ expression: exprJson, exclusion: exclJson }] } };
}
