<?php

#[AllowDynamicProperties]
class da_DK {
    public function __construct() {
        $this->version = 2;
        $array = array();
        $this->array = &$array;

        $array["index.welcome.main"] = "Velkommen til {server}'s bandliste.";
        $array["index.welcome.sub"] = " Her kan du se alle afstraffelser.";

        $array["title.index"] = 'Hjem';
        $array["title.bans"] = 'Bans';
        $array["title.mutes"] = 'Mutes';
        $array["title.warnings"] = 'Advarsler';
        $array["title.kicks"] = 'Kicks';
        $array["title.player-history"] = "Seneste straffe for {name}";
        $array["title.staff-history"] = "Seneste straffe af {name}";


        $array["generic.ban"] = "Ban";
        $array["generic.mute"] = "Mute";
        $array["generic.warn"] = "Advarsel";
        $array["generic.kick"] = "Kick";

        $array["generic.unban"] = "Unban";
        $array["generic.unmute"] = "Unmute";

        $array["generic.banned"] = "Bandlyst";
        $array["generic.muted"] = "Muted";
        $array["generic.warned"] = "Advaret";
        $array["generic.kicked"] = "Kicked";

        $array["generic.unbanned"] = "Unbanned";
        $array["generic.unmuted"] = "Unmuted";

        $array["generic.banned.by"] = $array["generic.banned"] . " Af";
        $array["generic.muted.by"] = $array["generic.muted"] . " Af";
        $array["generic.warned.by"] = $array["generic.warned"] . " Af";
        $array["generic.kicked.by"] = $array["generic.kicked"] . " Af";

        $array["generic.ipban"] = "IP " . $array["generic.ban"];
        $array["generic.ipmute"] = "IP " . $array["generic.mute"];

        $array["generic.permanent"] = "Permanent";
        $array["generic.permanent.ban"] = $array['generic.permanent'] . ' ' . $array["generic.ban"];
        $array["generic.permanent.mute"] = $array['generic.permanent'] . ' ' . $array["generic.mute"];

        $array["generic.type"] = "Type";
        $array["generic.active"] = "Aktiv";
        $array["generic.inactive"] = "Inaktiv";
        $array["generic.expired"] = "Udløbet";
        $array["generic.expired.kick"] = "N/A";
        $array["generic.player-name"] = "Spiller";

        $array["page.expired.ban"] = '(' . $array["generic.unbanned"] . ')';
        $array["page.expired.ban-by"] = '(' . $array["generic.unbanned"] . ' af {name})';
        $array["page.expired.mute"] = '(' . $array["generic.unmuted"] . ')';
        $array["page.expired.mute-by"] = '(' . $array["generic.unmuted"] . ' af {name})';
        $array["page.expired.warning"] = '(' . $array["generic.expired"] . ')';

        $array["table.player"] = $array["generic.player-name"];
        $array["table.type"] = $array["generic.type"];
        $array["table.executor"] = "Moderator";
        $array["table.reason"] = "Årsag";
        $array["table.reason.unban"] = $array["generic.unban"] . " " . $array["table.reason"];
        $array["table.reason.unmute"] = $array["generic.unmute"] . " " . $array["table.reason"];
        $array["table.date"] = "Dato";
        $array["table.expires"] = "Udløber";
        $array["table.received-warning"] = "Advarsel modtaget";


        $array["table.server.name"] = "Server";
        $array["table.server.scope"] = "Server Scope";
        $array["table.server.origin"] = "Oprindelsesserver";
        $array["table.server.global"] = "*";
        $array["table.pager.number"] = "Side";

        $array["action.check"] = "Tjek";
        $array["action.return"] = "Tilbage til {origin}";

        $array["error.missing-args"] = "Manglende argumenter.";
        $array["error.name.unseen"] = "{name} har ikke spillet på serveren før.";
        $array["error.name.invalid"] = "Ugyldigt navn.";
        $array["history.error.uuid.no-result"] = "Ingen straffe fundet.";
        $array["info.error.id.no-result"] = "Fejl: {type} blev ikke fundet i databasen.";
    }
}
