import { DiagnosticSeverity, type Diagnostic as VsDiagnostic } from 'vscode-languageserver-types';

import { parseText } from './fraud-services';
import type { Model } from './generated/ast.js';
import { modelToJson } from './transform';

export type Diagnostic = {
  message: string;
  from: number;
  to: number;
  severity: 'error' | 'warning' | 'info';
};

/** Валидация строки правила с нормализованными позициями (offsetы) */
export async function validateRule(text: string): Promise<Diagnostic[]> {
  const doc = await parseText(text);
  const lspDiags: readonly VsDiagnostic[] = doc.diagnostics ?? [];
  const td = doc.textDocument;
  return lspDiags.map((d) => {
    const from = td ? td.offsetAt(d.range.start) : 0;
    const to = td ? td.offsetAt(d.range.end) : Math.max(from + 1, from);
    const severity =
      d.severity === DiagnosticSeverity.Error
        ? 'error'
        : d.severity === DiagnosticSeverity.Warning
          ? 'warning'
          : 'info';
    return { message: d.message, from, to, severity };
  });
}

/** Парсит expression (+ опционально exclusion) в целевой JSON */
export async function parseRuleToJson(expression: string, exclusion?: string) {
  // expression
  const exprDoc = await parseText(expression);
  const exprErrors = (exprDoc.diagnostics ?? []).some(
    (d) => d.severity === DiagnosticSeverity.Error,
  );
  if (exprErrors) {
    throw new Error('Expression: есть ошибки синтаксиса/валидации.');
  }
  const exprModel = exprDoc.parseResult.value as Model;
  const exprJson = modelToJson(exprModel).expression;

  // exclusion (опционально)
  let exclJson: unknown[] = [];
  if (exclusion?.trim()) {
    const exclDoc = await parseText(exclusion);
    const exclErrors = (exclDoc.diagnostics ?? []).some(
      (d) => d.severity === DiagnosticSeverity.Error,
    );
    if (exclErrors) {
      throw new Error('Exclusion: есть ошибки синтаксиса/валидации.');
    }
    const exclModel = exclDoc.parseResult.value as Model;
    exclJson = modelToJson(exclModel).expression;
  }

  return { rules: [{ expression: exprJson, exclusion: exclJson }] };
}
