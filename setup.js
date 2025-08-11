#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupTingay() {
  log.title('🏳️‍🌈 TINGAY - Configuración Inicial');
  
  log.info('¡Bienvenido a Tingay! Vamos a configurar tu aplicación de citas LGBTQ+.');
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log.warning('Ya existe un archivo .env. ¿Quieres sobrescribirlo?');
    const overwrite = await question('Sobrescribir .env existente? (s/N): ');
    if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'si') {
      log.info('Configuración cancelada. Tu archivo .env actual se mantiene.');
      rl.close();
      return;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  log.title('📊 Configuración de Base de Datos');
  
  log.info('Opciones de base de datos:');
  console.log('1. MongoDB Atlas (Recomendado para producción)');
  console.log('2. MongoDB Local (Para desarrollo)');
  console.log('3. Modo Demo (Sin base de datos)');
  
  const dbChoice = await question('\nSelecciona una opción (1-3): ');
  
  let mongoUri = '';
  
  switch (dbChoice) {
    case '1':
      log.info('\nPara MongoDB Atlas:');
      console.log('1. Ve a https://www.mongodb.com/atlas');
      console.log('2. Crea una cuenta y un cluster gratuito');
      console.log('3. Crea un usuario de base de datos');
      console.log('4. Obtén tu string de conexión');
      mongoUri = await question('\nPega tu MongoDB Atlas URI: ');
      break;
    case '2':
      mongoUri = 'mongodb://localhost:27017/tingay';
      log.success('Configurado para MongoDB local');
      break;
    case '3':
      mongoUri = '';
      log.warning('Modo demo seleccionado - sin persistencia de datos');
      break;
    default:
      log.error('Opción inválida. Usando modo demo.');
      mongoUri = '';
  }
  
  console.log('\n' + '='.repeat(50));
  log.title('🔐 Configuración de Seguridad');
  
  // Generate secure JWT secret
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  log.success('JWT Secret generado automáticamente');
  
  console.log('\n' + '='.repeat(50));
  log.title('🌐 Configuración del Servidor');
  
  const port = await question('Puerto del servidor (3000): ') || '3000';
  const nodeEnv = await question('Entorno (development/production) [development]: ') || 'development';
  
  console.log('\n' + '='.repeat(50));
  log.title('🗝️ Claves de API (Opcional)');
  
  log.info('Las siguientes claves son opcionales pero recomendadas:');
  const geocodingKey = await question('Clave de Geocodificación (opcional): ');
  
  // Create .env content
  const envContent = `# Tingay App - Configuración Generada Automáticamente
# Generado el: ${new Date().toISOString()}

# Configuración del Servidor
PORT=${port}
NODE_ENV=${nodeEnv}

# Conexión a MongoDB
${mongoUri ? `MONGODB_URI=${mongoUri}` : '# MONGODB_URI=tu_string_de_conexion_mongodb'}

# Secreto JWT (¡NO COMPARTAS ESTO!)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Claves de API
${geocodingKey ? `GEOCODING_API_KEY=${geocodingKey}` : '# GEOCODING_API_KEY=tu_clave_de_geocodificacion'}

# Configuración adicional
MAX_FILE_SIZE=5mb
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;
  
  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    log.success('Archivo .env creado exitosamente');
  } catch (error) {
    log.error('Error creando archivo .env: ' + error.message);
    rl.close();
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  log.title('📦 Instalación de Dependencias');
  
  const installDeps = await question('¿Instalar dependencias ahora? (S/n): ');
  if (installDeps.toLowerCase() !== 'n' && installDeps.toLowerCase() !== 'no') {
    log.info('Instalando dependencias...');
    const { spawn } = require('child_process');
    
    const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        log.success('Dependencias instaladas correctamente');
        showFinalInstructions();
      } else {
        log.error('Error instalando dependencias');
        log.info('Ejecuta manualmente: npm install');
        showFinalInstructions();
      }
      rl.close();
    });
  } else {
    showFinalInstructions();
    rl.close();
  }
}

function showFinalInstructions() {
  console.log('\n' + '='.repeat(50));
  log.title('🎉 ¡Configuración Completada!');
  
  log.info('Tu aplicación Tingay está lista. Para iniciarla:');
  console.log('');
  console.log(`${colors.cyan}# Opción 1: Usar el script de inicio${colors.reset}`);
  console.log('npm run start');
  console.log('');
  console.log(`${colors.cyan}# Opción 2: Inicio manual${colors.reset}`);
  console.log('# Terminal 1: Backend');
  console.log('node server.js');
  console.log('');
  console.log('# Terminal 2: Frontend');
  console.log('npm run dev:frontend');
  console.log('');
  
  log.success('Luego abre http://localhost:3000 en tu navegador');
  
  console.log('\n' + '='.repeat(50));
  log.title('📚 Recursos Útiles');
  
  console.log('• README.md - Documentación completa');
  console.log('• .env - Tu configuración (¡NO la compartas!)');
  console.log('• GitHub Issues - Para reportar problemas');
  
  console.log('');
  log.success('¡Disfruta construyendo conexiones inclusivas con Tingay! 🏳️‍🌈');
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n');
  log.info('Configuración cancelada por el usuario.');
  rl.close();
  process.exit(0);
});

// Start setup
setupTingay().catch((error) => {
  log.error('Error durante la configuración: ' + error.message);
  rl.close();
  process.exit(1);
});