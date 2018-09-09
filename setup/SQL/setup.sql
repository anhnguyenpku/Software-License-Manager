CREATE TABLE IF NOT EXISTS `slm_users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `login` TEXT NULL COMMENT '',
  `secret` LONGTEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `sml_settings` (
  `key` varchar(45) NOT NULL COMMENT '',
  `value` TEXT NOT NULL COMMENT '',
  PRIMARY KEY (`key`)  COMMENT '')
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `sml_user_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `userid` INT NOT NULL COMMENT '',
  `cookie` TEXT NOT NULL COMMENT '',
  `ipadress` TEXT NOT NULL COMMENT '',
  `expirationdate` TEXT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;

INSERT INTO `sml_settings` (`key`, `value`) VALUES ('authenticate.expiration', '5');
INSERT INTO `sml_settings` (`key`, `value`) VALUES ('authenticate.divider', ':');
INSERT INTO `sml_settings` (`key`, `value`) VALUES ('authenticate.iterations', '100000');
INSERT INTO `sml_settings` (`key`, `value`) VALUES ('authenticate.secretlen', '512');
INSERT INTO `sml_settings` (`key`, `value`) VALUES ('authenticate.saltlen', '25');