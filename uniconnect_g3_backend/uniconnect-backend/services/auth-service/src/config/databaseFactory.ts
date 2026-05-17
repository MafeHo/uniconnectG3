/**
 * Factory para obtener BD según el ambiente
 * CRÍTICO: En tests, USA EMULADOR. En producción, USA BD REAL.
 */

import * as admin from 'firebase-admin';

export class DatabaseFactory {
  /**
   * Obtiene la instancia correcta de BD según el ambiente
   * @returns {admin.firestore.Firestore} Instancia de Firestore
   */
  static getDatabase(): admin.firestore.Firestore {
    // En ambiente de testing, usar Firestore Emulator
    if (process.env.NODE_ENV === 'test') {
      return this._getTestDatabase();
    }

    // En producción, usar BD real
    return this._getProductionDatabase();
  }

  /**
   * Obtiene BD de producción (credenciales reales)
   * @private
   */
  private static _getProductionDatabase(): admin.firestore.Firestore {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
        try {
          privateKey = Buffer.from(
            process.env.FIREBASE_PRIVATE_KEY_BASE64,
            'base64'
          ).toString('utf8');
        } catch (e) {
          console.error('ERROR: Failed to decode FIREBASE_PRIVATE_KEY_BASE64');
        }
      }

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error(
          'ERROR: Missing Firebase environment variables for production'
        );
      }

      const formattedKey = privateKey
        ?.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: formattedKey,
          clientEmail,
        }),
      });

      console.log(`🔐 Conectando a BD de producción: ${projectId}`);
    }

    return admin.firestore();
  }

  /**
   * Obtiene BD de test (Firestore Emulator)
   * PROTECCIÓN: Si falla, lanza error en lugar de conectar a producción
   * @private
   */
  private static _getTestDatabase(): admin.firestore.Firestore {
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

    if (!emulatorHost) {
      throw new Error(
        'FALLO CRÍTICO en tests: FIRESTORE_EMULATOR_HOST no configurado. ' +
        'Ejecuta: firebase emulators:start --only firestore'
      );
    }

    // Verificar que emulador apunta a localhost (no a un servidor remoto)
    if (!emulatorHost.includes('localhost') && !emulatorHost.includes('127.0.0.1')) {
      throw new Error(
        'FALLO CRÍTICO en tests: FIRESTORE_EMULATOR_HOST no apunta a localhost. ' +
        'Esto podría conectar a una BD remota. Configura: FIRESTORE_EMULATOR_HOST=localhost:8080'
      );
    }

    // Limpiar apps previas
    admin.apps.forEach(app => app?.delete());

    // Inicializar solo con projectId (Emulator no necesita credenciales)
    admin.initializeApp(
      {
        projectId: process.env.FIREBASE_TEST_PROJECT_ID || 'test-project',
      },
      'test-app'
    );

    const db = admin.app('test-app').firestore();

    console.log(`✓ Conectando a Firestore Emulator: ${emulatorHost} (TEST)`);
    console.log(
      `✓ Proyecto de test: ${process.env.FIREBASE_TEST_PROJECT_ID || 'test-project'}`
    );
    console.log('✓ PROTECCIÓN: BD completamente aislada en memoria');

    return db;
  }
}
