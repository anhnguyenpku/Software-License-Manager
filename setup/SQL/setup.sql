--Create Tables--

CREATE TABLE IF NOT EXISTS `slm_users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `login` TEXT NULL COMMENT '',
  `secret` LONGTEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `licenseServer`.`sml_settings` (
  `key` TEXT NOT NULL COMMENT '',
  `value` TEXT NOT NULL COMMENT '',
  PRIMARY KEY (`key`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `licenseServer`.`sml_user_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `userid` INT NOT NULL COMMENT '',
  `cookie` TEXT NOT NULL COMMENT '',
  `ipadress` TEXT NOT NULL COMMENT '',
  `expirationdate` TEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

--Inserts--

INSERT INTO `licenseServer`.`sml_settings` (`key`, `value`) VALUES ('authenticate.expiration', '5');
INSERT INTO `licenseServer`.`sml_settings` (`key`, `value`) VALUES ('authenticate.divider', ':');
INSERT INTO `licenseServer`.`sml_settings` (`key`, `value`) VALUES ('authenticate.iterations', '100000');
INSERT INTO `licenseServer`.`sml_settings` (`key`, `value`) VALUES ('authenticate.secretlen', '512');
INSERT INTO `licenseServer`.`sml_settings` (`key`, `value`) VALUES ('authenticate.saltlen', '25');