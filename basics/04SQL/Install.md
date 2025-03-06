# MySQL Installation Guide

## Step 1: Download MySQL Installer
1. Visit [MySQL Downloads Page](https://dev.mysql.com/downloads/installer/)
2. Download the appropriate installer for your operating system

## Step 2: Installation Process
1. Launch the MySQL installer
2. Choose "Custom Setup" during installation
3. Select the following components:
   - MySQL Server
   - MySQL Workbench
   - MySQL Shell

## Step 3: Configuration
1. Create a root user account
2. Set a secure password
3. Configure additional settings as needed

## Step 4: Environment Setup
1. Add MySQL bin directory to System PATH:
   - Windows: Add `C:\Program Files\MySQL\MySQL Server 8.0\bin`
   - Linux/Mac: Usually automatically added

## Step 5: Verify Installation
Open a terminal/command prompt and run:
```bash
mysql --version
```
You should see the MySQL version information if installation was successful.

## Additional Resources
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL Workbench Manual](https://dev.mysql.com/doc/workbench/en/)
- [MySQL Shell Documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/)