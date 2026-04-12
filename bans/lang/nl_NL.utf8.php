<?php

#[AllowDynamicProperties]
class nl_NL {
    public function __construct() {
        $this->version = 2;
        $array = array();
        $this->array = &$array;

        $array["index.welcome.main"] = "Welkom op {server}'s Ban Lijst.";
        $array["index.welcome.sub"] = 'Hier staan al onze uitgedeelde straffen.';

        $array["title.index"] = 'Home';
        $array["title.bans"] = 'Bans';
        $array["title.mutes"] = 'Mutes';
        $array["title.warnings"] = 'Waarschuwingen';
        $array["title.kicks"] = 'Kicks';
        $array["title.player-history"] = "Recente Straffen voor {name}";
        $array["title.staff-history"] = "Recente Straffen door {name}";

        $array["generic.ban"] = "Ban";
        $array["generic.mute"] = "Mute";
        $array["generic.warn"] = "Waarschuwing";
        $array["generic.kick"] = "Kick";

        $array["generic.unban"] = "Unban";
        $array["generic.unmute"] = "Unmute";

        $array["generic.banned"] = "Geband";
        $array["generic.muted"] = "Gemuted";
        $array["generic.warned"] = "Gewaarschuwd";
        $array["generic.kicked"] = "Gekicked";

        $array["generic.unbanned"] = "Unbanned";
        $array["generic.unmuted"] = "Unmuted";

        $array["generic.banned.by"] = $array["generic.banned"] . " Door";
        $array["generic.muted.by"] = $array["generic.muted"] . " Door";
        $array["generic.warned.by"] = $array["generic.warned"] . " Door";
        $array["generic.kicked.by"] = $array["generic.kicked"] . " Door";

        $array["generic.ipban"] = "IP " . $array["generic.ban"];
        $array["generic.ipmute"] = "IP " . $array["generic.mute"];

        $array["generic.permanent"] = "Permanent";
        $array["generic.permanent.ban"] = $array['generic.permanent'] . ' ' . $array["generic.ban"];
        $array["generic.permanent.mute"] = $array['generic.permanent'] . ' ' . $array["generic.mute"];

        $array["generic.type"] = "Type";
        $array["generic.active"] = "Actief";
        $array["generic.inactive"] = "Inactief";
        $array["generic.expired"] = "Verlopen";
        $array["generic.expired.kick"] = "N/A";
        $array["generic.player-name"] = "Speler";

        $array["page.expired.ban"] = '(' . $array["generic.unbanned"] . ')';
        $array["page.expired.ban-by"] = '(' . $array["generic.unbanned"] . ' door {name})';
        $array["page.expired.mute"] = '(' . $array["generic.unmuted"] . ')';
        $array["page.expired.mute-by"] = '(' . $array["generic.unmuted"] . ' door {name})';
        $array["page.expired.warning"] = '(' . $array["generic.expired"] . ')';

        $array["table.player"] = $array["generic.player-name"];
        $array["table.type"] = $array["generic.type"];
        $array["table.executor"] = "Moderator";
        $array["table.reason"] = "Reden";
        $array["table.reason.unban"] = $array["generic.unban"] . " " . $array["table.reason"];
        $array["table.reason.unmute"] = $array["generic.unmute"] . " " . $array["table.reason"];
        $array["table.date"] = "Datum";
        $array["table.expires"] = "Verloop Datum";
        $array["table.received-warning"] = "Waarschuwing ontvangen";

        $array["table.server.name"] = "Server";
        $array["table.server.scope"] = "Server Scope";
        $array["table.server.origin"] = "Originele Server";
        $array["table.server.global"] = "*";
        $array["table.pager.number"] = "Pagina";

        $array["action.check"] = "Check";
        $array["action.return"] = "Terug naar {origin}";


        $array["error.missing-args"] = "Missende parameters.";
        $array["error.name.unseen"] = "{name} heeft niet eerder gejoined.";
        $array["error.name.invalid"] = "Ongeldige naam.";
        $array["history.error.uuid.no-result"] = "Geen straffen gevonden.";
        $array["info.error.id.no-result"] = "Error: {type} is niet gevonden in database.";
    }
}
