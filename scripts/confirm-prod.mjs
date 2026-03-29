import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

console.log(`\n${red}⚠️  ADVERTENCIA DE SEGURIDAD ⚠️${reset}`);
console.log(`${yellow}Estás ejecutando un build de PRODUCCIÓN con subida automática a Cloudflare R2.${reset}`);
console.log(`Esto afectará a los archivos estáticos que ven los usuarios finales.\n`);

// Skip confirmation if running in CI (Cloudflare Pages, Github Actions, etc.)
if (process.env.CI) {
  console.log(`\n🤖 Entorno CI detectado. Omitiendo confirmación manual...\n`);
  process.exit(0);
}

rl.question(`¿Estás seguro de que quieres continuar? Escribe ${red}'SI'${reset} para confirmar: `, (answer) => {
  if (answer.trim().toUpperCase() === 'SI') {
    console.log(`\n✅ Confirmación recibida. Iniciando proceso de producción...\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ Operación cancelada por el usuario.\n`);
    process.exit(1);
  }
});
