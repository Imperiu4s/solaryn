<?php

#[AllowDynamicProperties]
class Database {
    public static $TRUE = "1", $FALSE = "0";

    public function __construct(Page $page, $connect, $verify) {
        if ($connect) {
            $this->connect($page, $verify);
        } else {
            $this->conn = null;
        }
    }

    function connect(Page $page, $verify = true) {
        $cfg = $page->settings;
        $driver = $cfg->driver;
        $host = $cfg->host;
        $port = $cfg->port;
        $database = $cfg->database;
        $username = $cfg->username;
        $password = $cfg->password;
        $this->verify = $verify;
        $this->active_query = "";

        if (strtolower($driver) === "mariadb") {
            $driver = "mysql";
        } elseif ($driver === "pgsql") {
            Database::$TRUE = "B'1'";
            Database::$FALSE = "B'0'";
        }

        if (!$cfg->show_inactive_bans) {
            $time = gettimeofday();
            $millis = $time["sec"] * 1000;
            $this->active_query = self::append_query($this->active_query, "active=" . Database::$TRUE);
            $this->active_query = self::append_query($this->active_query, "(until<1 OR until>$millis)");
        }

        if (!$cfg->show_silent_bans) {
            $this->active_query = self::append_query($this->active_query, "silent=" . Database::$FALSE);
        }

        if ($username === "" && $password === "") {
            $page->redirect("error/unconfigured.php");
        }

        $dsn = "$driver:dbname=$database;host=$host;port=$port";
        if ($driver === 'mysql') {
            $dsn .= ';charset=utf8';
        }

        $options = array(
            PDO::ATTR_TIMEOUT            => 5,
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
        );

        try {
            $this->conn = new PDO($dsn, $username, $password, $options);

            if (!$cfg->header_show_totals && $verify) {
                $st = $this->conn->query("SELECT * FROM " . $cfg->table['config'] . " LIMIT 1;");
                $st->fetch();
                $st->closeCursor();
            }
        } catch (PDOException $e) {
            $this->handle_error($page, $e);
        }
        if ($driver === 'pgsql') {
            $this->conn->exec("SET NAMES 'UTF8';");
        }
    }

    static function append_query($existing, $new) {
        if ($existing !== "") {
            return "$existing AND $new";
        }
        return "WHERE $new";
    }

    /**
     * @param $cfg Settings
     * @param $e Exception
     * @throws Exception
     */
    function handle_error(Page $page, Exception $e) {
        $cfg = $page->settings;
        if ($cfg->error_throw) throw $e;

        $message = 'Database error: ' . $e->getMessage();
        if ($cfg->error_pages) {
            if (strstr($message, "Access denied for user")) {
                $param = "";
                if ($cfg->error_reporting) $param = "?error=" . base64_encode($e->getMessage());
                $page->redirect("error/access-denied.php$param");
            }
            if (strstr($message, "Base table or view not found:") || strstr($message, "Unknown column")) {
                try {
                    $st = $this->conn->query("SELECT * FROM " . $cfg->table['bans'] . " LIMIT 1;");
                    $st->fetch();
                    $st->closeCursor();
                } catch (PDOException $e) {
                    $page->redirect("error/tables-not-found.php");
                }
                $page->redirect("error/outdated-plugin.php");
            }
        }
        if (!$cfg->error_reporting) $message = "Database error";
        die($message);
    }
}
