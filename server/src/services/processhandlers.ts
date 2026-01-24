import process from 'node:process';

export const initProcessHandlers = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('UNHANDLED REJECTION! Shutting down...');

    if (reason instanceof Error) {
      console.error(reason.name, reason.message);
    } else {
      console.error('Non-Error rejection:', reason);
    }

    process.exit(1);
  });
}
