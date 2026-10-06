import { build } from 'tsdown';

await build({ watch: true });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    process.exit(0);
  });
}
