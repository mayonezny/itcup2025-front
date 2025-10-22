// src/shared/lang/fraud-services.ts
import {
    createDefaultCoreModule,
    createDefaultSharedCoreModule,
    inject,
    URI,
    type FileSystemProvider,
    type LangiumDocument,
} from 'langium';

import { FraudRulesGeneratedModule, fraudRulesGeneratedSharedModule } from './generated/module.js';
import { FraudRulesValidator } from './validator'; // ← без .js

/** Мягкая заглушка FS-провайдера: ничего не читает, но удовлетворяет Langium */
function inMemoryFsProvider(): FileSystemProvider {
  const p = {
    // async
    stat: async (uri: unknown) => ({
      uri,
      isFile: true,
      isDirectory: false,
      ctime: 0,
      mtime: 0,
      size: 0,
    }),
    exists: async (_uri: unknown) => true,
    readFile: async (_uri: unknown) => '',
    readDirectory: async (_uri: unknown) => [],
    readlink: async (_uri: unknown) => '',
    realPath: async (uri: unknown) => String(uri),

    // sync
    statSync: (uri: unknown) => ({
      uri,
      isFile: true,
      isDirectory: false,
      ctime: 0,
      mtime: 0,
      size: 0,
    }),
    existsSync: (_uri: unknown) => true,
    readFileSync: (_uri: unknown) => '',
    readDirectorySync: (_uri: unknown) => [],
    readlinkSync: (_uri: unknown) => '',
    realPathSync: (uri: unknown) => String(uri),
  };
  return p as unknown as FileSystemProvider;
}

/** Сборка сервисов Langium v4 (core) без реального ФС */
function createFraudServices() {
  const shared = inject(
    createDefaultSharedCoreModule({
      fileSystemProvider: () => inMemoryFsProvider(), // ← даём заглушку
    }),
    fraudRulesGeneratedSharedModule,
  );

  const FraudRules = inject(createDefaultCoreModule({ shared }), FraudRulesGeneratedModule);

  // обязательно регистрируем язык, иначе «service registry is empty»
  shared.ServiceRegistry.register(FraudRules);

  // подключаем свои проверки
  new FraudRulesValidator().register(FraudRules);

  return { shared, FraudRules };
}

let services: ReturnType<typeof createFraudServices> | null = null;

export function getFraudServices() {
  if (!services) {
    services = createFraudServices();
  }
  return services;
}

/** Парсинг + валидация текста правила */
export async function parseText(text: string): Promise<LangiumDocument> {
  const { shared } = getFraudServices();
  const uri = URI.from({ scheme: 'inmemory', path: '/model.frule' });
  const doc = shared.workspace.LangiumDocumentFactory.fromString(text, uri);
  await shared.workspace.DocumentBuilder.build([doc]); // diagnostics → doc.diagnostics
  return doc;
}

/** Диагностики по тексту */
export async function validateText(text: string) {
  const doc = await parseText(text);
  return doc.diagnostics ?? [];
}
