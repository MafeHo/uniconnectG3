import * as cron from 'node-cron';
import * as admin from 'firebase-admin';

function enviarEmailResumen(userId: string, contenido: string): void {
  console.log(`\n📧 [EMAIL RESUMEN SIMULADO] -> Para: ${userId}`);
  console.log(`====================================================`);
  console.log(contenido);
  console.log(`====================================================\n`);
}

export async function processDailySummary(): Promise<void> {
  console.log('[DailySummaryJob] 🔄 Iniciando procesamiento del buffer diario...');
  const db = admin.firestore();
  
  try {
    const dailyBufferRef = db.collection('daily_buffer');
    const usersSnapshot = await dailyBufferRef.get();

    if (usersSnapshot.empty) {
      console.log('[DailySummaryJob] No hay usuarios en el buffer diario.');
      return;
    }

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      try {
        const notificationsRef = userDoc.ref.collection('notifications');
        const notificationsSnapshot = await notificationsRef.get();

        if (notificationsSnapshot.empty) {
          continue;
        }

        let totalMessages = 0;
        let totalMentions = 0;
        let totalEvents = 0;
        let other = 0;

        const batch = db.batch();

        notificationsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.type === 'NUEVO_MENSAJE') totalMessages++;
          else if (data.type === 'MENCION') totalMentions++;
          else if (data.type === 'NUEVO_EVENTO') totalEvents++;
          else other++;

          batch.delete(doc.ref);
        });

        const contenido = `Hola,\nAquí tienes tu resumen diario en UniConnect:\n` +
          `- 💬 ${totalMessages} mensajes nuevos.\n` +
          `- 🔔 ${totalMentions} menciones en grupos.\n` +
          `- 📅 ${totalEvents} eventos nuevos.\n` +
          `- 📌 ${other} otras notificaciones.\n\n` +
          `¡Revisa la plataforma para más detalles!`;

        enviarEmailResumen(userId, contenido);

        await batch.commit();
        
        console.log(`[DailySummaryJob] ✅ Resumen enviado y buffer limpiado para ${userId}`);
      } catch (userError: unknown) {
        const errMsg = userError instanceof Error ? userError.message : String(userError);
        console.error(`[DailySummaryJob] ❌ Error procesando al usuario ${userId}:`, errMsg);
      }
    }
    
    console.log('[DailySummaryJob] 🏁 Procesamiento del resumen diario finalizado.');
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[DailySummaryJob] Error global en el job:', errMsg);
  }
}

export function startDailySummaryJob(): void {
  cron.schedule('0 20 * * *', () => {
    processDailySummary();
  });
  console.log('⏰ Daily Summary Job programado para ejecutarse a las 20:00 diariamente.');
}
