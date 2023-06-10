import type {
  BaileysEventEmitter,
} from '@whiskeysockets/baileys';
import { useLogger, usePrisma } from '../shared';
import type { BaileysEventHandler } from '../types';
import { transformPrisma } from '../utils';


export default function messageHandler(sessionId: string, event: BaileysEventEmitter) {
  const prisma = usePrisma();
  const logger = useLogger();
  let listening = false;

  const set: BaileysEventHandler<'messaging-history.set'> = async ({ messages, isLatest }) => {
    try {
      await prisma.$transaction(async (tx) => {
        if (isLatest) await tx.message.deleteMany({ where: { sessionId } });

        await tx.message.createMany({
          data: messages.map((message) => ({
            ...transformPrisma(message),
            remoteJid: message.key.remoteJid!,
            id: message.key.id!,
            sessionId,
          })),
        });
      });
      logger.info({ messages: messages.length }, 'Synced messages');
    } catch (e) {
      logger.error(e, 'An error occured during messages set');
    }
  };

  const upsert: BaileysEventHandler<'messages.upsert'> = async () => {
    logger.info('Sync stopped');
  };

  const update: BaileysEventHandler<'messages.update'> = async () => {
    logger.info('Sync stopped');
  };

  const del: BaileysEventHandler<'messages.delete'> = async () => {
    try {
      logger.info('Sync stopped');
    } catch (e) {
      logger.error(e, 'An error occured during message delete');
    }
  };

  const updateReceipt: BaileysEventHandler<'message-receipt.update'> = async () => {
    logger.info('Sync stopped');
  };

  const updateReaction: BaileysEventHandler<'messages.reaction'> = async () => {
    logger.info('Sync stopped');
  };

  const listen = () => {
    if (listening) return;

    event.on('messaging-history.set', set);
    event.on('messages.upsert', upsert);
    event.on('messages.update', update);
    event.on('messages.delete', del);
    event.on('message-receipt.update', updateReceipt);
    event.on('messages.reaction', updateReaction);
    listening = true;
  };

  const unlisten = () => {
    if (!listening) return;

    event.off('messaging-history.set', set);
    event.off('messages.upsert', upsert);
    event.off('messages.update', update);
    event.off('messages.delete', del);
    event.off('message-receipt.update', updateReceipt);
    event.off('messages.reaction', updateReaction);
    listening = false;
  };

  return { listen, unlisten };
}
