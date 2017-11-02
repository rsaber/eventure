CREATE DATABASE IF NOT EXISTS eventure;

use eventure;

create user 'eventure'@'localhost' identified by 'password';
grant all on eventure.* to 'eventure'@'localhost';

CREATE TABLE IF NOT EXISTS user (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(80),
  PRIMARY KEY(id),
  UNIQUE KEY(email),
  bio VARCHAR(1000),
  profile_picture LONGTEXT
);

CREATE TABLE IF NOT EXISTS event_table (
  id INT NOT NULL AUTO_INCREMENT,
  creator_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  category VARCHAR(50),
  price FLOAT,
  longitude FLOAT,
  latitude FLOAT,
  locality VARCHAR(255),
  maps_url VARCHAR(500),
  location_name VARCHAR(255),
  location_address VARCHAR(255),
  link VARCHAR(255),
  image_url LONGTEXT,
  PRIMARY KEY(id),
  CONSTRAINT fk_creator_id FOREIGN KEY (creator_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS save (
  id INT NOT NULL AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY(id),
  CONSTRAINT fk_event_id FOREIGN KEY(event_id) REFERENCES event_table(id),
  CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS session_token (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES user(id)
);
