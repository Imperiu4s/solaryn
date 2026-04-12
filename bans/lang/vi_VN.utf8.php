<?php

#[AllowDynamicProperties]
class vi_VN {
    public function __construct() {
        $this->version = 2;
        $array = array();
        $this->array = &$array;

        $array["index.welcome.main"] = "Chào mừng đến với {server}'s Ban List.";
        $array["index.welcome.sub"] = "Đây là nơi liệt kê các vi phạm của người chơi.";

        $array["title.index"] = 'Trang chủ';
        $array["title.bans"] = 'Khóa tài khoản';
        $array["title.mutes"] = 'Cấm chát';
        $array["title.warnings"] = 'Cảnh cáo';
        $array["title.kicks"] = 'Đuổi';
        $array["title.player-history"] = "Các vi phạm gần đây của {name}";
        $array["title.staff-history"] = "Các xử lý vi phạm gần đây của {name}";


        $array["generic.ban"] = "Khóa tài khoản";
        $array["generic.mute"] = "Cấm chát";
        $array["generic.warn"] = "Cảnh cáo";
        $array["generic.kick"] = "Đuổi";

        $array["generic.unban"] = "Mở khóa tài khoản";
        $array["generic.unmute"] = "Mở chát";

        $array["generic.banned"] = "Đã khóa";
        $array["generic.muted"] = "Đã cấm chát";
        $array["generic.warned"] = "Đã cảnh cáo";
        $array["generic.kicked"] = "Đã đuổi";

        $array["generic.unbanned"] = "Đã mở khóa";
        $array["generic.unmuted"] = "Đã mở chát";

        $array["generic.banned.by"] = $array["generic.banned"] . " bởi";
        $array["generic.muted.by"] = $array["generic.muted"] . " bởi";
        $array["generic.warned.by"] = $array["generic.warned"] . " bởi";
        $array["generic.kicked.by"] = $array["generic.kicked"] . " bởi";

        $array["generic.ipban"] = "IP " . $array["generic.ban"];
        $array["generic.ipmute"] = "IP " . $array["generic.mute"];

        $array["generic.permanent"] = "Vĩnh viễn";
        $array["generic.permanent.ban"] = $array['generic.permanent'] . ' ' . $array["generic.ban"];
        $array["generic.permanent.mute"] = $array['generic.permanent'] . ' ' . $array["generic.mute"];

        $array["generic.type"] = "Loại";
        $array["generic.active"] = "Còn hiệu lực";
        $array["generic.inactive"] = "Hết hiệu lực";
        $array["generic.expired"] = "Đã hết hạn";
        $array["generic.expired.kick"] = "N/A";
        $array["generic.player-name"] = "Người chơi";

        $array["page.expired.ban"] = '(' . $array["generic.unbanned"] . ')';
        $array["page.expired.ban-by"] = '(' . $array["generic.unbanned"] . ' bởi {name})';
        $array["page.expired.mute"] = '(' . $array["generic.unmuted"] . ')';
        $array["page.expired.mute-by"] = '(' . $array["generic.unmuted"] . ' bởi {name})';
        $array["page.expired.warning"] = '(' . $array["generic.expired"] . ')';

        $array["table.player"] = $array["generic.player-name"];
        $array["table.type"] = $array["generic.type"];
        $array["table.executor"] = "Người xử phạt";
        $array["table.reason"] = "Lý do";
        $array["table.reason.unban"] = $array["generic.unban"] . " " . $array["table.reason"];
        $array["table.reason.unmute"] = $array["generic.unmute"] . " " . $array["table.reason"];
        $array["table.date"] = "Ngày";
        $array["table.expires"] = "Thời hạn";
        $array["table.received-warning"] = "Cảnh cáo đã nhận";


        $array["table.server.name"] = "Máy chủ";
        $array["table.server.scope"] = "Phạm vi máy chủ";
        $array["table.server.origin"] = "Vi phạm tại máy chủ";
        $array["table.server.global"] = "*";
        $array["table.pager.number"] = "Trang";

        $array["action.check"] = "Kiểm tra";
        $array["action.return"] = "Quay trở lại {origin}";

        $array["error.missing-args"] = "Thiếu đối số.";
        $array["error.name.unseen"] = "{name} chưa từng truy cập.";
        $array["error.name.invalid"] = "Tên không đúng.";
        $array["history.error.uuid.no-result"] = "Không tìm thấy vi phạm.";
        $array["info.error.id.no-result"] = "Lỗi: {type} không tìm thấy trong cơ sở dữ liệu.";
    }
}
