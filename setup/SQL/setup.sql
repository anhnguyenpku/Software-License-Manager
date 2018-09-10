CREATE TABLE IF NOT EXISTS `slm_users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `login` TEXT NULL COMMENT '',
  `secret` LONGTEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `slm_settings` (
  `key` varchar(45) NOT NULL COMMENT '',
  `value` TEXT NOT NULL COMMENT '',
  PRIMARY KEY (`key`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `slm_user_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `userid` INT NOT NULL COMMENT '',
  `cookie` TEXT NOT NULL COMMENT '',
  `ipadress` TEXT NOT NULL COMMENT '',
  `expirationdate` TEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `slm_software` (
  `id` VARCHAR(10) NOT NULL COMMENT '',
  `name` TEXT NULL COMMENT '',
  `distributor` TEXT NULL COMMENT '',
  `lastVersion` VARCHAR(10) NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `slm_software_versions` (
  `id` VARCHAR(10) NOT NULL COMMENT '',
  `label` TINYTEXT NOT NULL COMMENT '',
  `software` TINYTEXT NOT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;


INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.expiration', '5');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.divider', ':');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.iterations', '100000');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.secretlen', '512');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.saltlen', '25');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('authenticate.cookielen', '25');

INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('files.sidlen', '8');
INSERT IGNORE INTO `slm_settings` (`key`, `value`) VALUES ('files.vidlen', '8');