@echo off
echo Enviando solicitud HTTP POST a reCAPTCHA Enterprise API...
echo.
echo NOTA: Reemplaza TOKEN con el token real de grecaptcha.enterprise.execute()
echo NOTA: Reemplaza USER_ACTION con la accion del usuario (opcional)
echo.

REM Usando curl para enviar la solicitud POST
curl -X POST "https://recaptchaenterprise.googleapis.com/v1/projects/soygay-b9bc5/assessments?key=AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw" ^
  -H "Content-Type: application/json" ^
  -d @request.json

echo.
echo Solicitud enviada. Revisa la respuesta arriba.
pause