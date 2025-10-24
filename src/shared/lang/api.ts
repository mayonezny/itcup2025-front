// src/shared/lang/api.ts
import { DiagnosticSeverity, type Diagnostic as VsDiagnostic } from 'vscode-languageserver-types';

import { parseText } from './fraud-services';
import type { Model } from './generated/ast.js';
import { collectSemanticDiagnostics } from './semantic';
import { modelToJson } from './transform';
import type { BuiltRule } from './types';

export type Diagnostic = {
  message: string;
  from: number;
  to: number;
  severity: 'error' | 'warning' | 'info';
};

function toUiDiags(text: string, arr: readonly VsDiagnostic[]): Diagnostic[] {
  return arr.map((d) => {
    const from = char(text, d.range?.start);
    const to = char(text, d.range?.end, from);
    const severity =
      d.severity === DiagnosticSeverity.Error
        ? 'error'
        : d.severity === DiagnosticSeverity.Warning
          ? 'warning'
          : 'info';
    return { message: d.message, from, to, severity };
  });
}
function char(src: string, pos?: { line: number; character: number }, fallback = 0): number {
  if (!pos) {
    return fallback;
  }
  // однострочный ввод — используем character как offset
  return Math.min(Math.max(pos.character, 0), src.length);
}

/** Собирает ВСЕ ошибки (Langium + семантика) с позициями */
export async function validateAll(text: string): Promise<Diagnostic[]> {
  const doc = await parseText(text);
  const model = doc.parseResult.value as Model;

  const lsp = toUiDiags(
    text,
    (doc.diagnostics ?? []).filter((d) => d.severity === DiagnosticSeverity.Error),
  );
  const sem = toUiDiags(text, collectSemanticDiagnostics(model, text));
  return [...lsp, ...sem];
}

/** Сборка одного правила (жёсткая валидация: если есть ошибки — исключение) */
export async function buildRuleJson(expression: string, exclusion?: string): Promise<BuiltRule> {
  // проверяем expression
  const exprErrs = await validateAll(expression);
  if (exprErrs.length) {
    const msg = exprErrs.map((e) => e.message).join('\n');
    throw new Error(msg);
  }
  const exprDoc = await parseText(expression);
  const exprJson = modelToJson(exprDoc.parseResult.value as Model).expression;

  // проверяем exclusion (если задан)
  let exclJson: BuiltRule['exclusion'] = [];
  if (exclusion?.trim()) {
    const exclErrs = await validateAll(exclusion);
    if (exclErrs.length) {
      const msg = exclErrs.map((e) => e.message).join('\n');
      throw new Error(msg);
    }
    const exclDoc = await parseText(exclusion);
    exclJson = modelToJson(exclDoc.parseResult.value as Model).expression;
  }

  return { expression: exprJson, exclusion: exclJson };
}
