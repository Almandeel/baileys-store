import type { BaileysEventEmitter } from '@adiwajshing/baileys';
// import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { useLogger } from '../shared';
import type { BaileysEventHandler } from '../types';
// import { transformPrisma } from '../utils';

export default function contactHandler(sessionId: string, event: BaileysEventEmitter) {
  // const prisma = usePrisma();
  const logger = useLogger();
  let listening = false;

  const set: BaileysEventHandler<'messaging-history.set'> = async () => {
    try {
      logger.info('Sync stopped');
    } catch (e) {
      logger.error(e, 'An error occured during contacts set');
    }
  };

  const upsert: BaileysEventHandler<'contacts.upsert'> = async () => {
    try {
      logger.info('Sync stopped');
    } catch (e) {
      logger.error(e, 'An error occured during contacts upsert');
    }
  };

  const update: BaileysEventHandler<'contacts.update'> = async () => {
    logger.info('Sync stopped');
  };

  const listen = () => {
    if (listening) return;

    event.on('messaging-history.set', set);
    event.on('contacts.upsert', upsert);
    event.on('contacts.update', update);
    listening = true;
  };

  const unlisten = () => {
    if (!listening) return;

    event.off('messaging-history.set', set);
    event.off('contacts.upsert', upsert);
    event.off('contacts.update', update);
    listening = false;
  };

  return { listen, unlisten };
}
