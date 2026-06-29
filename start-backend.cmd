@echo off
echo Demarrage du backend SkillSet...
cd /d "%~dp0backend\app"
mvnw.cmd spring-boot:run
