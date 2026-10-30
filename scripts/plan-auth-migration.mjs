import { readFile, writeFile } from 'node:fs/promises';
import { planAuthMigration } from '../src/utils/authMigration.js';

const args = process.argv.slice(2);
const option = (name) => args.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
if (args.some((value) => !/^--(roster|accounts|out)=.+/.test(value)) || !option('roster') || !option('out')) {
  console.error('Uso: node scripts/plan-auth-migration.mjs --roster=integrantes.json [--accounts=vinculos.json] --out=plano.local.json');
  process.exitCode = 1;
} else {
  try {
    const roster = JSON.parse(await readFile(option('roster'), 'utf8'));
    const accounts = option('accounts') ? JSON.parse(await readFile(option('accounts'), 'utf8')) : [];
    const plan = planAuthMigration({ students: roster, accounts });
    // Do not overwrite an existing plan or the original roster by mistake.
    await writeFile(option('out'), `${JSON.stringify(plan, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    console.log(`Plano local gerado para ${plan.entries.length} integrantes. Nenhuma conta ou registro foi alterado. A ativação continua pendente.`);
  } catch (error) { console.error(error instanceof SyntaxError ? 'O arquivo JSON é inválido. Revise-o localmente; nenhum conteúdo foi enviado.' : error.code === 'EEXIST' ? 'O arquivo de saída já existe. Escolha outro nome.' : error.message); process.exitCode = 1; }
}
