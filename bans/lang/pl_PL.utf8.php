<?php

#[AllowDynamicProperties]
class pl_PL {
    public function __construct() {
        $this->version = 2;
        $array = array();
        $this->array = &$array;

        $array["index.welcome.main"] = "Witaj na liście banów {server}.";
        $array["index.welcome.sub"] = "Tutaj jest lista wszystkich kar naszego serwera.";

        $array["title.index"] = 'Strona główna';
        $array["title.bans"] = 'Bany';
        $array["title.mutes"] = 'Wyciszenia';
        $array["title.warnings"] = 'Ostrzeżenia';
        $array["title.kicks"] = 'Wyrzucenia';
        $array["title.player-history"] = "Ostatnie kary gracza {name}";
        $array["title.staff-history"] = "Ostatnie kary nadane przez {name}";


        $array["generic.ban"] = "Ban";
        $array["generic.mute"] = "Wyciszenie";
        $array["generic.warn"] = "Ostrzeżenie";
        $array["generic.kick"] = "Wyrzucenie";

        $array["generic.unban"] = "Odbanowanie";
        $array["generic.unmute"] = "Odciszenie";

        $array["generic.banned"] = "Zbanowany";
        $array["generic.muted"] = "Wyciszony";
        $array["generic.warned"] = "Ostrzeżony";
        $array["generic.kicked"] = "Wyrzucony";

        $array["generic.unbanned"] = "Odbanowany";
        $array["generic.unmuted"] = "Odciszony";

        $array["generic.banned.by"] = $array["generic.banned"] . " przez";
        $array["generic.muted.by"] = $array["generic.muted"] . " przez";
        $array["generic.warned.by"] = $array["generic.warned"] . " przez";
        $array["generic.kicked.by"] = $array["generic.kicked"] . " przez";

        $array["generic.ipban"] = "IP " . $array["generic.ban"];
        $array["generic.ipmute"] = "IP " . $array["generic.mute"];

        $array["generic.permanent"] = "Na zawsze";
        $array["generic.permanent.ban"] = $array['generic.permanent'];
        $array["generic.permanent.mute"] = $array['generic.permanent'];

        $array["generic.type"] = "Typ";
        $array["generic.active"] = "Aktywny";
        $array["generic.inactive"] = "Nieaktywny";
        $array["generic.expired"] = "Wygasł";
        $array["generic.expired.kick"] = "N/A";
        $array["generic.player-name"] = "Gracz";

        $array["page.expired.ban"] = '(' . $array["generic.unbanned"] . ')';
        $array["page.expired.ban-by"] = '(' . $array["generic.unbanned"] . ' przez {name})';
        $array["page.expired.mute"] = '(' . $array["generic.unmuted"] . ')';
        $array["page.expired.mute-by"] = '(' . $array["generic.unmuted"] . ' przez {name})';
        $array["page.expired.warning"] = '(' . $array["generic.expired"] . ')';

        $array["table.player"] = "Ukarany";
        $array["table.type"] = $array["generic.type"];
        $array["table.executor"] = "Karający";
        $array["table.reason"] = "Powód";
        $array["table.reason.unban"] = "Powód odbanowania";
        $array["table.reason.unmute"] = "Powód odciszenia";
        $array["table.date"] = "Data";
        $array["table.expires"] = "Wygasa";
        $array["table.received-warning"] = "Otrzymał ostrzeżenie";


        $array["table.server.name"] = "Serwer";
        $array["table.server.scope"] = "Serwer obowiązujący";
        $array["table.server.origin"] = "Pochodzący z serwera";
        $array["table.server.global"] = "*";
        $array["table.pager.number"] = "Strona";

        $array["action.check"] = "Sprawdź";
        $array["action.return"] = "Wróć do {origin}";

        $array["error.missing-args"] = "Brakujące argumenty.";
        $array["error.name.unseen"] = "{name} nie dołączył nigdy na serwer.";
        $array["error.name.invalid"] = "Niepoprawna nazwa.";
        $array["history.error.uuid.no-result"] = "Nie znaleziono kar.";
        $array["info.error.id.no-result"] = "Błąd: {type} nie został znaleziony w bazie danych.";
    }
}
