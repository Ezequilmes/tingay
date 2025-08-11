// Script de prueba para integración de reCAPTCHA Enterprise con Firebase App Check
// Este script simula eventos reales de la aplicación para verificar la configuración

const SITE_KEY = '6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI';
const API_KEY = 'AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw';
const PROJECT_ID = 'soygay-b9bc5';

// Configuración de pruebas
const TEST_ACTIONS = [
    'LOGIN',
    'REGISTER', 
    'PROFILE_UPDATE',
    'SEND_MESSAGE',
    'LIKE_PROFILE',
    'UPLOAD_PHOTO'
];

class RecaptchaIntegrationTester {
    constructor() {
        this.results = [];
        this.isRecaptchaReady = false;
        this.testStartTime = null;
    }

    // Inicializar el tester
    async init() {
        console.log('🚀 Iniciando pruebas de integración de reCAPTCHA Enterprise');
        console.log(`📋 Proyecto: ${PROJECT_ID}`);
        console.log(`🔑 Site Key: ${SITE_KEY}`);
        console.log(`🌐 Dominio: ${window.location.hostname}`);
        
        this.testStartTime = new Date();
        
        // Verificar si reCAPTCHA está disponible
        await this.waitForRecaptcha();
        
        if (this.isRecaptchaReady) {
            console.log('✅ reCAPTCHA Enterprise está listo');
            await this.runAllTests();
        } else {
            console.error('❌ reCAPTCHA Enterprise no está disponible');
        }
    }

    // Esperar a que reCAPTCHA esté listo
    async waitForRecaptcha(maxWait = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
                this.isRecaptchaReady = true;
                return true;
            }
            await this.sleep(500);
        }
        
        return false;
    }

    // Función de utilidad para esperar
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Ejecutar todas las pruebas
    async runAllTests() {
        console.log('\n🧪 Ejecutando suite completa de pruebas...');
        
        for (const action of TEST_ACTIONS) {
            try {
                console.log(`\n--- Probando acción: ${action} ---`);
                const result = await this.testAction(action);
                this.results.push(result);
                
                // Esperar entre pruebas para evitar rate limiting
                await this.sleep(2000);
                
            } catch (error) {
                console.error(`❌ Error en prueba ${action}:`, error);
                this.results.push({
                    action,
                    success: false,
                    error: error.message,
                    timestamp: new Date()
                });
            }
        }
        
        this.generateReport();
    }

    // Probar una acción específica
    async testAction(action) {
        const startTime = Date.now();
        
        try {
            // 1. Ejecutar reCAPTCHA
            console.log(`🔄 Ejecutando reCAPTCHA para ${action}...`);
            const token = await grecaptcha.enterprise.execute(SITE_KEY, {
                action: action
            });
            
            const tokenTime = Date.now() - startTime;
            console.log(`✅ Token obtenido en ${tokenTime}ms: ${token.substring(0, 30)}...`);
            
            // 2. Verificar token con API
            console.log(`📡 Verificando token con reCAPTCHA Enterprise API...`);
            const apiResult = await this.verifyTokenWithAPI(token, action);
            
            const totalTime = Date.now() - startTime;
            
            const result = {
                action,
                success: true,
                token: token.substring(0, 50) + '...',
                tokenGenerationTime: tokenTime,
                totalTime,
                apiResponse: apiResult,
                timestamp: new Date()
            };
            
            console.log(`✅ Prueba ${action} completada exitosamente en ${totalTime}ms`);
            return result;
            
        } catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ Error en prueba ${action}:`, error.message);
            
            return {
                action,
                success: false,
                error: error.message,
                totalTime,
                timestamp: new Date()
            };
        }
    }

    // Verificar token con la API de reCAPTCHA Enterprise
    async verifyTokenWithAPI(token, action) {
        const requestData = {
            event: {
                token: token,
                expectedAction: action,
                siteKey: SITE_KEY
            }
        };
        
        const response = await fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        
        console.log(`📊 Puntuación de riesgo: ${result.riskAnalysis?.score || 'N/A'}`);
        console.log(`🔍 Razones: ${result.riskAnalysis?.reasons?.join(', ') || 'Ninguna'}`);
        console.log(`✅ Token válido: ${result.tokenProperties?.valid ? 'Sí' : 'No'}`);
        console.log(`🎯 Acción verificada: ${result.tokenProperties?.action || 'N/A'}`);
        
        return {
            score: result.riskAnalysis?.score,
            reasons: result.riskAnalysis?.reasons || [],
            valid: result.tokenProperties?.valid,
            action: result.tokenProperties?.action,
            hostname: result.tokenProperties?.hostname
        };
    }

    // Generar reporte final
    generateReport() {
        const endTime = new Date();
        const totalDuration = endTime - this.testStartTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE FINAL DE PRUEBAS DE reCAPTCHA ENTERPRISE');
        console.log('='.repeat(60));
        
        console.log(`⏱️  Duración total: ${totalDuration}ms`);
        console.log(`🧪 Pruebas ejecutadas: ${this.results.length}`);
        
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.length - successful;
        
        console.log(`✅ Exitosas: ${successful}`);
        console.log(`❌ Fallidas: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((successful / this.results.length) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detalle de resultados:');
        this.results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.action}:`);
            console.log(`   Estado: ${result.success ? '✅ ÉXITO' : '❌ FALLO'}`);
            
            if (result.success) {
                console.log(`   Tiempo total: ${result.totalTime}ms`);
                console.log(`   Tiempo de token: ${result.tokenGenerationTime}ms`);
                console.log(`   Puntuación: ${result.apiResponse?.score || 'N/A'}`);
                console.log(`   Token válido: ${result.apiResponse?.valid ? 'Sí' : 'No'}`);
            } else {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        // Recomendaciones
        console.log('\n💡 RECOMENDACIONES:');
        
        if (failed === 0) {
            console.log('🎉 ¡Excelente! Todas las pruebas pasaron exitosamente.');
            console.log('✅ reCAPTCHA Enterprise está correctamente configurado.');
            console.log('✅ La integración frontend-backend funciona correctamente.');
        } else {
            console.log('⚠️  Se detectaron algunos problemas:');
            
            const errorTypes = [...new Set(this.results.filter(r => !r.success).map(r => r.error))];
            errorTypes.forEach(error => {
                console.log(`   - ${error}`);
            });
            
            console.log('\n🔧 Acciones sugeridas:');
            console.log('   1. Verificar configuración de dominios en reCAPTCHA Enterprise');
            console.log('   2. Confirmar que la API key tiene permisos correctos');
            console.log('   3. Revisar configuración de Firebase App Check');
            console.log('   4. Consultar RECAPTCHA_ENTERPRISE_SETUP.md para más detalles');
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Guardar resultados en localStorage para referencia
        try {
            localStorage.setItem('recaptcha_test_results', JSON.stringify({
                timestamp: endTime,
                duration: totalDuration,
                results: this.results,
                summary: {
                    total: this.results.length,
                    successful,
                    failed,
                    successRate: (successful / this.results.length) * 100
                }
            }));
            console.log('💾 Resultados guardados en localStorage como "recaptcha_test_results"');
        } catch (e) {
            console.warn('⚠️  No se pudieron guardar los resultados en localStorage');
        }
    }

    // Método para ejecutar una prueba individual desde la consola
    async testSingle(action) {
        if (!this.isRecaptchaReady) {
            await this.waitForRecaptcha();
        }
        
        if (this.isRecaptchaReady) {
            return await this.testAction(action);
        } else {
            throw new Error('reCAPTCHA Enterprise no está disponible');
        }
    }
}

// Crear instancia global para uso en consola
window.recaptchaTester = new RecaptchaIntegrationTester();

// Auto-inicializar si se carga como script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Script de prueba de reCAPTCHA cargado. Usa recaptchaTester.init() para comenzar.');
    });
} else {
    console.log('🔄 Script de prueba de reCAPTCHA cargado. Usa recaptchaTester.init() para comenzar.');
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecaptchaIntegrationTester;
}

// Funciones de utilidad para la consola
window.testRecaptcha = {
    // Ejecutar todas las pruebas
    runAll: () => window.recaptchaTester.init(),
    
    // Ejecutar prueba individual
    test: (action) => window.recaptchaTester.testSingle(action),
    
    // Ver últimos resultados
    getResults: () => {
        try {
            const results = localStorage.getItem('recaptcha_test_results');
            return results ? JSON.parse(results) : null;
        } catch (e) {
            console.error('Error obteniendo resultados:', e);
            return null;
        }
    },
    
    // Limpiar resultados guardados
    clearResults: () => {
        localStorage.removeItem('recaptcha_test_results');
        console.log('🗑️ Resultados limpiados');
    }
};

console.log('\n🎯 COMANDOS DISPONIBLES:');
console.log('testRecaptcha.runAll() - Ejecutar todas las pruebas');
console.log('testRecaptcha.test("LOGIN") - Probar acción específica');
console.log('testRecaptcha.getResults() - Ver últimos resultados');
console.log('testRecaptcha.clearResults() - Limpiar resultados guardados');
console.log('\n💡 Ejemplo: testRecaptcha.runAll()');