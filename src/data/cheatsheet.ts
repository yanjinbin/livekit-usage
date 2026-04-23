export type Category = "lk" | "sip" | "rtp" | "net" | "obs" | "media";

export interface Example {
  /** 可直接运行的完整命令（含真实参数） */
  input: string;
  /** 终端实际输出文本 */
  output: string;
  /** 输出字段逐行解释，全局开关控制显隐 */
  explain: string;
}

export interface Entry {
  /** Level 1：一句话中文描述 */
  desc: string;
  /** Level 1：命令模板（可含 \\ 换行） */
  cmd: string;
  tags: string[];
  /** Level 2：具体输入输出示例（可选） */
  example?: Example;
}

export interface Card {
  cat: Category;
  tool: string;
  entries: Entry[];
}

export const CATEGORY_COLORS: Record<Category, string> = {
  lk:    "var(--lk)",
  sip:   "var(--sip)",
  rtp:   "var(--rtp)",
  net:   "var(--net)",
  obs:   "var(--obs)",
  media: "var(--media)",
};

export const CATEGORY_TAG_STYLES: Record<Category, string> = {
  lk:    "background:rgba(0,212,170,.1);color:var(--lk)",
  sip:   "background:rgba(255,107,107,.1);color:var(--sip)",
  rtp:   "background:rgba(79,195,247,.1);color:var(--rtp)",
  net:   "background:rgba(255,213,79,.1);color:var(--net)",
  obs:   "background:rgba(206,147,216,.1);color:var(--obs)",
  media: "background:rgba(129,199,132,.1);color:var(--media)",
};

export const CATEGORY_LABELS: Record<Category | "all", string> = {
  all:   "全部",
  lk:    "lk CLI",
  sip:   "SIP / sngrep",
  rtp:   "RTP / Wireshark",
  net:   "网络 / 诊断",
  obs:   "可观测性",
  media: "媒体 / ffmpeg",
};

export const data: Card[] = [
  // ── lk CLI ──────────────────────────────────────────────
  {
    cat: "lk", tool: "lk room",
    entries: [
      {
        desc: "列出所有房间",
        cmd:  "lk room list --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret",
        tags: ["基础"],
        example: {
          input:  "lk room list --url ws://localhost:7880 --api-key devkey --api-secret secret",
          output: "RoomName    SID                Participants  Publisher  Duration\nmy-room     RM_abc123def456    3             2          00:15:32\ntest-room   RM_xyz789uvw012    1             1          00:02:10",
          explain:
            "RoomName     → 房间名称，创建/加入时由客户端指定\n" +
            "SID          → 服务端分配的全局唯一 ID（RM_ 前缀）\n" +
            "Participants → 当前在线参与者总数（含发布者和纯订阅者）\n" +
            "Publisher    → 当前正在推流（发布 track）的参与者数\n" +
            "Duration     → 房间自首个参与者加入起的已存活时长",
        },
      },
      {
        desc: "加入房间（模拟参与者）",
        cmd:  "lk room join --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret \\\n  --identity bot my-room",
        tags: ["测试"],
        example: {
          input:  "lk room join --url ws://localhost:7880 --api-key devkey --api-secret secret --identity bot my-room",
          output: "Connected to room my-room\nLocal participant: bot (PA_xxxx)\nPress Ctrl+C to exit",
          explain:
            "Connected to room → 已成功建立 WebRTC 信令连接\n" +
            "Local participant → 当前模拟身份（identity）及服务端分配的参与者 ID（PA_ 前缀）\n" +
            "Ctrl+C 退出后，服务端会触发 ParticipantLeft 事件",
        },
      },
      {
        desc: "发布 demo 视频进入房间",
        cmd:  "lk room join --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret \\\n  --identity bot --publish-demo my-room",
        tags: ["媒体", "测试"],
        example: {
          input:  "lk room join --url ws://localhost:7880 --api-key devkey --api-secret secret --identity bot --publish-demo my-room",
          output: "Connected to room my-room\nPublishing demo video track: TR_video_xxxx (VP8 640x480@30fps)\nPublishing demo audio track: TR_audio_xxxx (Opus 48kHz)",
          explain:
            "TR_video_xxxx → 视频 track 的唯一 ID（TR_ 前缀）\n" +
            "VP8 640x480@30fps → 编码格式 / 分辨率 / 帧率，demo 源固定参数\n" +
            "TR_audio_xxxx → 音频 track ID\n" +
            "Opus 48kHz → 音频编码格式及采样率，LiveKit 默认使用 Opus",
        },
      },
      {
        desc: "发布自定义音视频文件",
        cmd:  "lk room join --identity pub \\\n  --publish video.ivf --publish audio.ogg \\\n  --fps 30 my-room",
        tags: ["媒体"],
        example: {
          input:  "lk room join --identity pub --publish video.ivf --publish audio.ogg --fps 30 my-room",
          output: "Connected to room my-room\nPublishing video.ivf as video track TR_video_xxxx (VP9)\nPublishing audio.ogg as audio track TR_audio_xxxx (Opus)\nFrame rate: 30 fps",
          explain:
            "video.ivf → IVF 格式 VP8/VP9 视频，lk CLI 原生支持（无需转码）\n" +
            "audio.ogg → Ogg Opus 音频，LiveKit 服务端直接转发，零重编码\n" +
            "--fps 30  → 控制推流帧率；若文件帧率不匹配会插帧或丢帧",
        },
      },
      {
        desc: "删除房间",
        cmd:  "lk room delete --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret my-room",
        tags: ["管理"],
        example: {
          input:  "lk room delete --url ws://localhost:7880 --api-key devkey --api-secret secret my-room",
          output: "Room my-room deleted successfully",
          explain:
            "删除房间会强制断开所有参与者连接并触发 RoomFinished 事件\n" +
            "录制中的 Egress 任务会自动停止并上传已录制片段\n" +
            "操作不可撤销，房间历史状态随之清除",
        },
      },
    ],
  },

  {
    cat: "lk", tool: "lk token",
    entries: [
      {
        desc: "生成加入房间的 token",
        cmd:  "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --join --room my-room --identity user1 \\\n  --valid-for 24h",
        tags: ["auth"],
        example: {
          input:  "lk token create --api-key devkey --api-secret secret --join --room my-room --identity user1 --valid-for 24h",
          output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwMDAwMDAsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ1c2VyMSIsIm5iZiI6MTY5OTkxMzYwMCwic3ViIjoidXNlcjEiLCJ2aWRlbyI6eyJyb29tIjoibXktcm9vbSIsInJvb21Kb2luIjp0cnVlfX0.SIGNATURE",
          explain:
            "输出是标准 JWT，三段 base64 以 '.' 分隔\n" +
            "Header  → 算法 HS256（HMAC-SHA256）\n" +
            "Payload → exp: 过期时间戳 | iss: api-key | sub/name: identity | video.roomJoin: true\n" +
            "Signature → 用 api-secret 签名，服务端校验防篡改\n" +
            "可用 jwt.io 解码 Payload 调试权限字段",
        },
      },
      {
        desc: "生成有 roomList 权限的 token",
        cmd:  "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --room-list --valid-for 1h",
        tags: ["auth", "api"],
        example: {
          input:  "lk token create --api-key devkey --api-secret secret --room-list --valid-for 1h",
          output: "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tTGlzdCI6dHJ1ZX0sImV4cCI6MTcwMDAwMDAwMH0.SIGNATURE",
          explain:
            "video.roomList: true → 允许调用 RoomService/ListRooms Twirp 接口\n" +
            "无 roomJoin 字段 → 该 token 不能用于加入任何房间\n" +
            "有效期 1h → 建议短期 token 用于服务端调用，避免泄露后长期可用",
        },
      },
      {
        desc: "生成 roomAdmin 权限 token（踢人/静音）",
        cmd:  "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --room-admin --room my-room --valid-for 1h",
        tags: ["auth", "管理"],
        example: {
          input:  "lk token create --api-key devkey --api-secret secret --room-admin --room my-room --valid-for 1h",
          output: "eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tQWRtaW4iOnRydWUsInJvb20iOiJteS1yb29tIn0sImV4cCI6MTcwMH0.SIGNATURE",
          explain:
            "roomAdmin: true → 可调用 RemoveParticipant / MutePublishedTrack / UpdateParticipant\n" +
            "room: my-room  → 权限范围限定为单个房间，不可跨房间操作\n" +
            "不包含 roomJoin → 管理员 token 和参与者 token 建议分开颁发",
        },
      },
    ],
  },

  {
    cat: "lk", tool: "lk load-test",
    entries: [
      {
        desc: "压测：8 视频发布 + 500 订阅",
        cmd:  "lk load-test --room test-room \\\n  --video-publishers 8 \\\n  --subscribers 500 --duration 1m",
        tags: ["压测"],
        example: {
          input:  "lk load-test --room test-room --video-publishers 8 --subscribers 500 --duration 1m",
          output: "Publishers: 8  Subscribers: 500  Duration: 1m0s\n---\nAvg recv bitrate:  28.4 Mbps\nAvg send bitrate:  3.6 Mbps\nPacket loss (recv): 0.02%\nJitter (recv):      4.2 ms\nNACK sent:          12\nPLI sent:           3",
          explain:
            "Avg recv bitrate  → 所有订阅者接收的平均总带宽\n" +
            "Avg send bitrate  → 每个发布者上行平均带宽\n" +
            "Packet loss       → 丢包率；> 1% 需检查网络或调整 simulcast 层\n" +
            "Jitter            → 抖动；> 30ms 会导致音视频不连续\n" +
            "NACK              → 接收端请求重传次数；过高说明丢包严重\n" +
            "PLI               → 关键帧请求次数；频繁触发说明视频质量差",
        },
      },
      {
        desc: "压测：5 路并发音频发言",
        cmd:  "lk load-test --room test-room \\\n  --audio-publishers 5",
        tags: ["压测", "音频"],
        example: {
          input:  "lk load-test --room test-room --audio-publishers 5",
          output: "Publishers: 5 (audio only)\nAvg send bitrate: 320 Kbps\nJitter: 2.1 ms\nPacket loss: 0.00%",
          explain:
            "audio only → 仅推 Opus 音频，无视频流\n" +
            "320 Kbps → 5路 × 64 Kbps（Opus 默认），符合预期\n" +
            "Jitter 2.1ms → 音频对抖动敏感，< 20ms 为健康范围",
        },
      },
      {
        desc: "压测并打开 Meet 观察结果",
        cmd:  "lk load-test --room test-room \\\n  --video-publishers 4 --open",
        tags: ["压测"],
        example: {
          input:  "lk load-test --room test-room --video-publishers 4 --open",
          output: "Publishers: 4\nOpening LiveKit Meet at https://meet.livekit.io?...\nPress Ctrl+C to stop",
          explain:
            "--open 会在浏览器打开 LiveKit Meet 并自动加入同一房间\n" +
            "可实时观察 4 路视频的渲染质量和 simulcast 降级行为\n" +
            "配合 chrome://webrtc-internals 查看详细 ICE / RTP 数据",
        },
      },
    ],
  },

  {
    cat: "lk", tool: "lk egress",
    entries: [
      {
        desc: "查看当前 Egress 任务",
        cmd:  "lk egress list --room my-room",
        tags: ["录制"],
        example: {
          input:  "lk egress list --room my-room",
          output: "EgressID       Type          Status   Room      Duration  Destination\nEG_abc123      RoomComposite  ACTIVE   my-room   00:05:21  s3://bucket/rec.mp4\nEG_def456      TrackComposite COMPLETE my-room   00:10:00  /tmp/out.mp4",
          explain:
            "EgressID    → 任务唯一 ID（EG_ 前缀），停止/查询时使用\n" +
            "Type        → RoomComposite: 合并所有轨道录制 | TrackComposite: 指定轨道\n" +
            "Status      → ACTIVE: 录制中 | COMPLETE: 已完成 | FAILED: 异常\n" +
            "Duration    → 已录制时长\n" +
            "Destination → 输出路径（S3/本地文件/RTMP 推流地址）",
        },
      },
      {
        desc: "停止指定 Egress 任务",
        cmd:  "lk egress stop --egress-id EG_xxxx",
        tags: ["录制"],
        example: {
          input:  "lk egress stop --egress-id EG_abc123",
          output: "Egress EG_abc123 stopped\nFinal duration: 00:05:21\nOutput: s3://bucket/my-room-2024.mp4 (245 MB)",
          explain:
            "停止后录制文件立即上传/落盘，不可恢复继续录制\n" +
            "Final duration → 实际录制总时长\n" +
            "Output size    → 文件大小，可估算码率是否符合预期",
        },
      },
    ],
  },

  {
    cat: "lk", tool: "Twirp curl",
    entries: [
      {
        desc: "列出所有房间（curl）",
        cmd:  "curl -X POST http://localhost:7880/twirp/livekit.RoomService/ListRooms \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{}'",
        tags: ["api"],
        example: {
          input:  "TOKEN=$(lk token create --api-key devkey --api-secret secret --room-list --valid-for 1h)\ncurl -s -X POST http://localhost:7880/twirp/livekit.RoomService/ListRooms -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" -d '{}'",
          output: '{\n  "rooms": [\n    {\n      "sid": "RM_abc123",\n      "name": "my-room",\n      "numParticipants": 3,\n      "numPublishers": 2,\n      "creationTime": "1700000000",\n      "emptyTimeout": 300\n    }\n  ]\n}',
          explain:
            "sid             → 服务端房间唯一 ID\n" +
            "name            → 客户端创建时指定的房间名\n" +
            "numParticipants → 当前在线人数（含观看者）\n" +
            "numPublishers   → 当前推流人数\n" +
            "creationTime    → Unix 时间戳（秒），首个参与者加入时创建\n" +
            "emptyTimeout    → 房间空置多少秒后自动销毁（0 = 永不自动销毁）",
        },
      },
      {
        desc: "查某房间的参与者",
        cmd:  "curl -X POST http://localhost:7880/twirp/livekit.RoomService/ListParticipants \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -d '{\"room\":\"my-room\"}'",
        tags: ["api"],
        example: {
          input:  "curl -s -X POST http://localhost:7880/twirp/livekit.RoomService/ListParticipants -H \"Authorization: Bearer $TOKEN\" -d '{\"room\":\"my-room\"}'",
          output: '{\n  "participants": [\n    {\n      "sid": "PA_abc",\n      "identity": "user1",\n      "state": "ACTIVE",\n      "tracks": [\n        { "sid": "TR_video", "type": "VIDEO", "muted": false }\n      ],\n      "joinedAt": "1700000000",\n      "clientVersion": "2.1.0"\n    }\n  ]\n}',
          explain:
            "sid           → 参与者唯一 ID（PA_ 前缀）\n" +
            "identity      → 客户端 token 里指定的身份标识\n" +
            "state         → ACTIVE: 在线 | DISCONNECTED: 已离线\n" +
            "tracks[].sid  → 该参与者发布的每条 track ID（TR_ 前缀）\n" +
            "tracks[].muted→ 是否被静音（本地静音或被管理员静音）\n" +
            "joinedAt      → 加入时间戳\n" +
            "clientVersion → 客户端 SDK 版本，排查兼容性问题用",
        },
      },
      {
        desc: "强制删除房间",
        cmd:  "curl -X POST http://localhost:7880/twirp/livekit.RoomService/DeleteRoom \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -d '{\"room\":\"my-room\"}'",
        tags: ["api", "管理"],
        example: {
          input:  "curl -s -X POST http://localhost:7880/twirp/livekit.RoomService/DeleteRoom -H \"Authorization: Bearer $TOKEN\" -d '{\"room\":\"my-room\"}'",
          output: "{}",
          explain:
            "返回空 JSON {} 表示删除成功（Twirp 惯例）\n" +
            "若返回 {\"code\":\"not_found\"} → 房间不存在或已被删除\n" +
            "若返回 {\"code\":\"unauthenticated\"} → token 缺少 roomAdmin 权限",
        },
      },
      {
        desc: "查 Egress 任务状态",
        cmd:  "curl -X POST http://localhost:7880/twirp/livekit.EgressService/ListEgress \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -d '{\"room_name\":\"my-room\"}'",
        tags: ["api", "录制"],
        example: {
          input:  "curl -s -X POST http://localhost:7880/twirp/livekit.EgressService/ListEgress -H \"Authorization: Bearer $TOKEN\" -d '{\"room_name\":\"my-room\"}'",
          output: '{\n  "items": [\n    {\n      "egress_id": "EG_abc123",\n      "status": "EGRESS_ACTIVE",\n      "room_name": "my-room",\n      "started_at": 1700000000000000000\n    }\n  ]\n}',
          explain:
            "egress_id   → 任务 ID，停止时用 lk egress stop --egress-id 指定\n" +
            "status      → EGRESS_ACTIVE: 录制中 | EGRESS_COMPLETE: 完成 | EGRESS_FAILED: 失败\n" +
            "started_at  → 纳秒时间戳（÷1e9 得秒），注意精度\n" +
            "若 items 为空 → 该房间当前没有运行中的 Egress 任务",
        },
      },
      {
        desc: "Twirp 错误码速查",
        cmd:  "unavailable    → Egress/SIP 没连上 Redis\nunauthenticated → token 过期或无权限\nnot_found       → room/participant 不存在\ninvalid_argument → 请求 body 字段有误",
        tags: ["错误码"],
        example: {
          input:  '# 模拟 unauthenticated 错误\ncurl -X POST http://localhost:7880/twirp/livekit.RoomService/ListRooms \\\n  -H "Authorization: Bearer INVALID_TOKEN" -d \'{}\'',
          output: '{\n  "code": "unauthenticated",\n  "msg": "invalid token"\n}',
          explain:
            "unauthenticated → token 签名错误、过期或 api-key 不匹配\n" +
            "unavailable     → 通常是服务端未启动或 Redis 断连\n" +
            "not_found       → 资源不存在，检查 room/identity 拼写\n" +
            "invalid_argument→ 请求体缺少必填字段或格式错误，对照 proto 定义排查",
        },
      },
    ],
  },

  // ── SIP / sngrep ────────────────────────────────────────
  {
    cat: "sip", tool: "sngrep",
    entries: [
      {
        desc: "实时抓 SIP 信令（梯形图）",
        cmd:  "sngrep",
        tags: ["实时"],
        example: {
          input:  "sngrep",
          output: "# 进入 TUI 界面\n┌─ SIP Messages ────────────────────────────────────────┐\n│ 14:05:01 192.168.1.10 → 192.168.1.1  INVITE sip:+1234 │\n│ 14:05:01 192.168.1.1  → 192.168.1.10 100 Trying       │\n│ 14:05:01 192.168.1.1  → 192.168.1.10 180 Ringing      │\n│ 14:05:03 192.168.1.1  → 192.168.1.10 200 OK           │\n│ 14:05:03 192.168.1.10 → 192.168.1.1  ACK              │\n└───────────────────────────────────────────────────────┘",
          explain:
            "INVITE  → 发起呼叫，携带 SDP offer（包含 RTP 地址/端口/编码）\n" +
            "100 Trying  → 代理已收到请求，正在路由（非终态）\n" +
            "180 Ringing → 被叫端已振铃（可能播放回铃音）\n" +
            "200 OK  → 被叫接听，携带 SDP answer\n" +
            "ACK     → 主叫确认，三次握手完成，RTP 媒体流开始传输\n" +
            "Enter 键 → 展开任意一行查看完整 SIP 消息体（含 SDP）",
        },
      },
      {
        desc: "只抓 5060 端口",
        cmd:  "sngrep port 5060",
        tags: ["实时"],
        example: {
          input:  "sngrep port 5060",
          output: "Listening on port 5060 (SIP default)...\n# 只显示 SIP over UDP/TCP port 5060 的消息",
          explain:
            "SIP 标准端口 5060（UDP/TCP），TLS 用 5061\n" +
            "若 carrier 使用非标准端口，替换 5060 为实际端口\n" +
            "LiveKit SIP 模块默认监听 5060",
        },
      },
      {
        desc: "抓指定 carrier IP",
        cmd:  "sngrep host <carrier-ip> port 5060",
        tags: ["实时"],
        example: {
          input:  "sngrep host 203.0.113.10 port 5060",
          output: "Filter: host 203.0.113.10 AND port 5060\n# 只显示与该 carrier 之间的 SIP 交互",
          explain:
            "过滤特定 IP 可排除内网其他 SIP 设备干扰\n" +
            "203.0.113.x 是 RFC 5737 文档保留段，实际换为 carrier 真实 IP\n" +
            "支持 BPF 过滤语法，等同于 tcpdump 的 -f 参数",
        },
      },
      {
        desc: "抓包同时存文件",
        cmd:  "sngrep -O capture.pcap",
        tags: ["存档"],
        example: {
          input:  "sngrep -O capture.pcap",
          output: "Capturing to capture.pcap...\n# 同时在 TUI 实时显示，Ctrl+C 停止后可用 Wireshark 打开",
          explain:
            "-O → 同步写入 pcap 文件，不影响实时显示\n" +
            "capture.pcap 可用 Wireshark / tshark 离线分析\n" +
            "建议复现问题时开启，保留现场证据",
        },
      },
      {
        desc: "读取已有 pcap 离线分析",
        cmd:  "sngrep -I capture.pcap",
        tags: ["离线"],
        example: {
          input:  "sngrep -I capture.pcap",
          output: "Reading from capture.pcap\n125 SIP dialogs found\n# 进入 TUI，可按时间/IP 过滤对话",
          explain:
            "-I → 离线模式，不监听网卡，直接解析 pcap\n" +
            "可配合 Wireshark 导出的 pcap 使用，方便跨机分析\n" +
            "dialogs 数量代表独立的 SIP 会话（Call-ID 维度）",
        },
      },
      {
        desc: "只看 INVITE 事务",
        cmd:  "sngrep port 5060\n# 启动后按 F7 过滤 INVITE",
        tags: ["过滤"],
        example: {
          input:  "sngrep port 5060\n# 启动后按 F7，输入过滤表达式：\nMethod == INVITE",
          output: "# 只显示 INVITE 发起的对话\n14:05:01 INVITE  my-room@sip.example.com  200 OK  00:02:15",
          explain:
            "F7 → 打开过滤输入框（BPF 语法扩展）\n" +
            "Method == INVITE → 只保留含 INVITE 的对话（含后续 180/200/BYE）\n" +
            "可组合：Method == INVITE && CSeq contains 'REGISTER' → 过滤注册中的 INVITE",
        },
      },
    ],
  },

  {
    cat: "sip", tool: "SIP 排障",
    entries: [
      {
        desc: "入向呼叫不进房间 → 看 INVITE 是否到达",
        cmd:  "sngrep port 5060\n# 确认看到 INVITE → 100 Trying → 180 Ringing",
        tags: ["入向"],
        example: {
          input:  "sngrep port 5060",
          output: "# 正常流程：\nINVITE → 100 → 180 → 200 → ACK\n\n# 异常：INVITE 到了但没有 100 Trying\n14:05:01 INVITE sip:room@livekit  (no response after 3s)\n\n# 异常：直接 404\n14:05:01 INVITE sip:room@livekit\n14:05:01 404 Not Found",
          explain:
            "无 100 Trying  → SIP 代理未收到或防火墙拦截，检查 UDP 5060 入站规则\n" +
            "404 Not Found  → LiveKit SIP 模块未找到对应的 Trunk/Dispatch Rule\n" +
            "403 Forbidden  → 鉴权失败，检查 SIP Trunk 的 username/password\n" +
            "超时无响应     → 检查 LiveKit 进程是否在监听 5060（lsof -i :5060）",
        },
      },
      {
        desc: "有通话无音频 → 看 SDP 里的 c= 和 m= 行",
        cmd:  "sngrep port 5060\n# Enter 展开消息体\n# c=IN IP4 <ip>   ← RTP 目标 IP\n# m=audio <port>  ← RTP 端口",
        tags: ["无声", "SDP"],
        example: {
          input:  "# 在 sngrep 中 Enter 展开 200 OK，查看 SDP body",
          output: "v=0\no=- 12345 67890 IN IP4 10.0.0.1\ns=-\nc=IN IP4 203.0.113.50\nt=0 0\nm=audio 20000 RTP/AVP 0 8 101\na=rtpmap:0 PCMU/8000\na=rtpmap:8 PCMA/8000\na=rtpmap:101 telephone-event/8000",
          explain:
            "c=IN IP4 203.0.113.50 → RTP 媒体流的目标 IP（不同于 SIP 信令 IP）\n" +
            "m=audio 20000        → RTP 音频目标端口，需确保防火墙放行\n" +
            "a=rtpmap:0 PCMU      → 编码 0 = G.711 μ-law（北美标准）\n" +
            "a=rtpmap:8 PCMA      → 编码 8 = G.711 A-law（欧洲标准）\n" +
            "a=rtpmap:101 telephone-event → DTMF 信号编码\n" +
            "若 LiveKit SIP 返回的 c= IP 是内网地址 → NAT 穿透配置有误",
        },
      },
      {
        desc: "出向呼叫 carrier 无响应",
        cmd:  "sngrep host <carrier-ip>\n# 看有没有 100 Trying 回来",
        tags: ["出向"],
        example: {
          input:  "sngrep host 203.0.113.10",
          output: "# 正常：\n14:10:00 INVITE → carrier  (sent)\n14:10:00 100 Trying ← carrier\n14:10:01 180 Ringing ← carrier\n\n# 异常：只发出 INVITE，没有任何回应\n14:10:00 INVITE → 203.0.113.10  (no response)\n14:10:03 INVITE → 203.0.113.10  (retry 1/3)\n14:10:06 INVITE → 203.0.113.10  (retry 2/3)",
          explain:
            "无 100 Trying → carrier IP/端口错误，或出站 UDP 被防火墙拦截\n" +
            "重试 3 次后挂断 → SIP 客户端事务超时，默认 32s\n" +
            "排查：ping carrier IP | nmap -sU -p 5060 carrier | 检查 SIP Trunk 配置",
        },
      },
    ],
  },

  // ── RTP / Wireshark ─────────────────────────────────────
  {
    cat: "rtp", tool: "Wireshark",
    entries: [
      {
        desc: "RTP 流过滤器",
        cmd:  "rtp || rtcp || stun || dtls",
        tags: ["过滤"],
        example: {
          input:  "# Wireshark 显示过滤栏输入：\nrtp || rtcp || stun || dtls",
          output: "# 只显示媒体相关协议包：\n# RTP  → 实际音视频数据\n# RTCP → 控制/统计报告\n# STUN → ICE 连通性检查\n# DTLS → 媒体加密握手",
          explain:
            "RTP  → 携带音视频负载，通过 SSRC 字段区分不同轨道\n" +
            "RTCP → SR(发送报告)/RR(接收报告) 包含丢包率/jitter/RTT\n" +
            "STUN → Binding Request/Response 用于 ICE 打洞\n" +
            "DTLS → ClientHello/ServerHello 用于建立 SRTP 加密信道\n" +
            "LiveKit 使用 SRTP，抓到的 RTP 内容是加密的，仅头部可读",
        },
      },
      {
        desc: "RTP 流统计（丢包/jitter 曲线）",
        cmd:  "Telephony → RTP → RTP Streams → Analyze",
        tags: ["统计"],
        example: {
          input:  "# 菜单路径：\nTelephony > RTP > RTP Streams\n# 选中目标流后点击 Analyze",
          output: "SSRC: 0xABCDEF01  Payload: 96 (VP8)\nPackets: 1842  Lost: 3  Loss%: 0.16%\nMax Delta: 35.2 ms  Max Jitter: 8.4 ms  Mean Jitter: 2.1 ms",
          explain:
            "SSRC     → 同步源标识符，唯一标识一路 RTP 流\n" +
            "Payload 96 → 动态编码号，对应 SDP 协商的编码（VP8/VP9/H264/Opus）\n" +
            "Lost%    → 丢包率；WebRTC 通常 < 1% 可接受，> 5% 明显卡顿\n" +
            "Max Delta→ 相邻包间最大时间差；> 100ms 说明有突发延迟\n" +
            "Jitter   → 到达时间抖动；视频 < 30ms，音频 < 20ms 为健康值",
        },
      },
      {
        desc: "RTCP 分析（发送端/接收端报告）",
        cmd:  "Telephony → RTP → RTCP Statistics",
        tags: ["统计"],
        example: {
          input:  "# 过滤栏：rtcp\n# 菜单：Telephony > RTP > RTCP Statistics",
          output: "RTCP SR (Sender Report):\n  SSRC: 0xABCDEF01\n  Packet count: 1842  Octet count: 2.1 MB\n  NTP timestamp: 2024-01-01 14:05:03.120\n\nRTCP RR (Receiver Report):\n  Fraction lost: 0/256 (0%)\n  Cumulative lost: 3\n  Jitter: 336 (2.1 ms @ 90kHz)\n  LSR/DLSR → RTT: 42 ms",
          explain:
            "SR Packet count  → 发送端累计发包数，用于核对接收端丢包\n" +
            "Fraction lost    → 近期丢包比例（0/256 即 0%）\n" +
            "Cumulative lost  → 累计总丢包数\n" +
            "Jitter (RTP单位) → 以时钟频率为单位（视频 90kHz，÷90000 得秒）\n" +
            "RTT              → 通过 LSR+DLSR 计算的往返延迟，> 300ms 体验差",
        },
      },
      {
        desc: "tshark 命令行抓 RTP 字段",
        cmd:  "tshark -i any \\\n  -Y rtp \\\n  -T fields \\\n  -e rtp.seq -e rtp.timestamp -e rtp.p_type",
        tags: ["命令行"],
        example: {
          input:  "tshark -i any -Y rtp -T fields -e rtp.seq -e rtp.timestamp -e rtp.p_type",
          output: "1024\t90000\t96\n1025\t93600\t96\n1026\t97200\t96\n1027\t100800\t96",
          explain:
            "rtp.seq       → 序列号，连续递增；跳号说明丢包（如 1025→1027 丢了 1026）\n" +
            "rtp.timestamp → RTP 时间戳（视频 90kHz 时钟）；差值 3600 ≈ 1帧@25fps\n" +
            "rtp.p_type    → 负载类型号；96 是动态分配，对应 SDP 中的编码\n" +
            "输出为 TSV，可 awk/python 进一步分析丢包分布",
        },
      },
      {
        desc: "tshark 抓 LiveKit UDP 媒体端口",
        cmd:  "tshark -i any \\\n  -f \"udp portrange 50000-60000\" \\\n  -w livekit_rtp.pcap",
        tags: ["命令行", "存档"],
        example: {
          input:  "tshark -i any -f 'udp portrange 50000-60000' -w livekit_rtp.pcap",
          output: "Capturing on 'any'\n2847 packets captured to livekit_rtp.pcap",
          explain:
            "50000-60000 → LiveKit 默认 UDP 媒体端口范围（config.yaml 中 rtc.port_range_start/end）\n" +
            "-f → 捕获过滤器（BPF），只捕获该范围 UDP，减少 IO 压力\n" +
            "-w → 写入 pcap 文件，Ctrl+C 停止后用 Wireshark 打开分析\n" +
            "若端口范围不匹配，livekit_rtp.pcap 将为空",
        },
      },
    ],
  },

  {
    cat: "rtp", tool: "WebRTC Internals",
    entries: [
      {
        desc: "打开 Chrome WebRTC 调试页",
        cmd:  "chrome://webrtc-internals",
        tags: ["browser"],
        example: {
          input:  "# 地址栏输入（需要已有活跃 WebRTC 连接）：\nchrome://webrtc-internals",
          output: "# 页面显示所有活跃 PeerConnection\nPeerConnection [0] (创建时间: 14:05:01)\n  ICE State: connected\n  Signaling State: stable\n  [Stats Tables / Charts...]",
          explain:
            "每个 PeerConnection 对应一个 WebRTC 连接\n" +
            "Stats Tables → 原始 getStats() 数据，每秒刷新\n" +
            "Charts → 关键指标时序图（bitrate/loss/rtt）\n" +
            "可导出 dump 文件用于离线分析",
        },
      },
      {
        desc: "查 ICE 连接状态",
        cmd:  "# RTCIceCandidatePair\n→ state: succeeded / failed\n→ currentRoundTripTime (RTT)",
        tags: ["ICE"],
        example: {
          input:  "# 在 webrtc-internals 找到 RTCIceCandidatePair 表格",
          output: "candidatePairId: CPxx\nstate: succeeded\nnominatedCandidate: host 192.168.1.10:54321\nremoteCandidate: srflx 203.0.113.50:7881\ncurrentRoundTripTime: 0.042  (s)\ntotalRoundTripTime: 2.1  (s)\nbytesReceived: 15728640\nbytesSent: 524288",
          explain:
            "state: succeeded     → 该 ICE 候选对已选中并在使用中\n" +
            "host                 → 本地直连候选（内网）\n" +
            "srflx (Server Reflexive) → 经过 STUN 发现的公网 IP:Port\n" +
            "prflx (Peer Reflexive)   → 对端收到后反射的 IP:Port\n" +
            "relay                → 经过 TURN 中继（NAT 穿透失败时使用）\n" +
            "currentRoundTripTime → 实时 RTT（秒），> 0.3s 体验明显下降",
        },
      },
      {
        desc: "查视频丢包 / 帧率",
        cmd:  "# RTCInboundRtpVideoStream\n→ packetsLost\n→ framesDecoded\n→ framesPerSecond",
        tags: ["视频"],
        example: {
          input:  "# 在 webrtc-internals 找到 RTCInboundRtpVideoStream",
          output: "kind: video\npacketsReceived: 18420\npacketsLost: 12\nframesDecoded: 1842\nframesDropped: 3\nframesPerSecond: 29.97\nfireDecodingDelay: 8.2  (ms)\njitterBufferDelay: 45.1  (ms)",
          explain:
            "packetsLost      → 累计丢包数（相对值）；>1% 可能花屏\n" +
            "framesDecoded    → 成功解码帧数\n" +
            "framesDropped    → 因解码器跟不上而丢弃的帧\n" +
            "framesPerSecond  → 实时帧率；低于目标帧率说明解码跟不上或丢包\n" +
            "fireDecodingDelay→ 帧解码耗时；H264/VP8 通常 < 5ms\n" +
            "jitterBufferDelay→ 缓冲区引入的延迟，越小越实时",
        },
      },
      {
        desc: "查音频 jitter",
        cmd:  "# RTCInboundRtpAudioStream\n→ jitter\n→ audioLevel\n→ totalSamplesReceived",
        tags: ["音频"],
        example: {
          input:  "# 在 webrtc-internals 找到 RTCInboundRtpAudioStream",
          output: "kind: audio\njitter: 0.0042  (s)\naudioLevel: 0.32\ntotalSamplesReceived: 480000\ntotalSamplesDuration: 10.0  (s)\nconcealedSamples: 120\nconcealmentEvents: 3",
          explain:
            "jitter (s)          → 音频到达抖动；> 0.05s（50ms）人耳可察觉\n" +
            "audioLevel          → 0~1 表示音量，0 = 静音，1 = 最大\n" +
            "totalSamplesReceived→ 总接收样本数；48kHz Opus 每秒 48000 个\n" +
            "concealedSamples    → 因丢包由 PLC（包丢失隐藏）补偿的样本数\n" +
            "concealmentEvents   → 触发 PLC 的次数；频繁触发说明网络质量差",
        },
      },
    ],
  },

  // ── 网络诊断 ────────────────────────────────────────────
  {
    cat: "net", tool: "lsof / ss",
    entries: [
      {
        desc: "查 LiveKit 端口占用",
        cmd:  "lsof -i :7880\nlsof -i :7881\nlsof -i :5060",
        tags: ["端口"],
        example: {
          input:  "lsof -i :7880 -i :7881",
          output: "COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nlivekit   1234 root   10u  IPv4  98765      0t0  TCP *:7880 (LISTEN)\nlivekit   1234 root   11u  IPv4  98766      0t0  TCP *:7881 (LISTEN)",
          explain:
            "7880 → WebSocket 信令端口（ws:// 或 wss://）\n" +
            "7881 → HTTPS/WHIP/WHEP 端口\n" +
            "5060 → SIP 信令端口（若启用 SIP 模块）\n" +
            "LISTEN → 端口正常监听；若无输出说明服务未启动或端口冲突",
        },
      },
      {
        desc: "查 UDP 媒体端口是否监听",
        cmd:  "lsof -i UDP | grep livekit",
        tags: ["UDP"],
        example: {
          input:  "lsof -i UDP | grep livekit",
          output: "livekit  1234 root  12u  IPv4  98767  0t0  UDP *:50000\nlivekit  1234 root  13u  IPv4  98768  0t0  UDP *:50001\nlivekit  1234 root  14u  IPv4  98769  0t0  UDP *:50002",
          explain:
            "UDP 50000+ → RTP 媒体端口，每路参与者分配一个\n" +
            "若端口列表为空 → config.yaml 的 rtc.port_range 未配置或服务异常\n" +
            "防火墙需放行该端口范围的 UDP 入站流量，否则 ICE 会回落到 TURN 中继",
        },
      },
    ],
  },

  {
    cat: "net", tool: "mtr / nmap",
    entries: [
      {
        desc: "诊断到 LiveKit Cloud 的路径",
        cmd:  "mtr --report cloud.livekit.io",
        tags: ["延迟"],
        example: {
          input:  "mtr --report --report-cycles 10 cloud.livekit.io",
          output: "HOST: myserver            Loss%   Snt  Last   Avg  Best  Wrst StDev\n  1. 192.168.1.1           0.0%    10   1.2   1.1   0.9   1.5   0.2\n  2. 10.0.0.1              0.0%    10   3.4   3.2   3.0   3.8   0.3\n  3. 203.0.113.1           0.0%    10  12.1  11.9  11.5  12.8   0.4\n  4. cloud.livekit.io      0.0%    10  42.3  41.8  41.2  43.1   0.6",
          explain:
            "Loss% → 该跳的丢包率；中间节点丢包 ≠ 路径真实丢包（ICMP 限速导致）\n" +
            "Avg   → 平均延迟（ms）；最后一跳即端到端 RTT\n" +
            "StDev → 标准差；> 5ms 说明延迟不稳定\n" +
            "关注最后一跳：< 50ms 优秀，50-150ms 可接受，> 150ms 体验差\n" +
            "中间跳 Loss% 高但最后一跳正常 → 是路由器限速 ICMP，不影响实际流量",
        },
      },
      {
        desc: "确认 LiveKit 端口是否对外开放",
        cmd:  "nmap -p 7880,7881,5060 <server-ip>",
        tags: ["端口"],
        example: {
          input:  "nmap -p 7880,7881,5060 203.0.113.50",
          output: "PORT     STATE  SERVICE\n7880/tcp open   unknown\n7881/tcp open   unknown\n5060/tcp closed sip",
          explain:
            "open   → 端口可访问（服务在监听且防火墙放行）\n" +
            "closed → 端口可达但无服务监听（可能 SIP 未启用或服务未启动）\n" +
            "filtered → 防火墙拦截，客户端无法连接\n" +
            "5060 TCP closed → SIP 通常走 UDP，需用 nmap -sU 扫 UDP 端口",
        },
      },
      {
        desc: "扫 UDP 媒体端口范围",
        cmd:  "nmap -sU -p 50000-50010 <server-ip>",
        tags: ["UDP", "端口"],
        example: {
          input:  "sudo nmap -sU -p 50000-50010 203.0.113.50",
          output: "PORT      STATE         SERVICE\n50000/udp open|filtered unknown\n50001/udp open|filtered unknown\n50002/udp open|filtered unknown",
          explain:
            "open|filtered → UDP 扫描特性：无响应时无法区分 open 和 filtered\n" +
            "需配合实际 ICE 连接测试（webrtc-internals）确认可达性\n" +
            "-sU 需要 root 权限（sudo）\n" +
            "若全部显示 filtered → 防火墙拦截 UDP，ICE 会强制走 TURN 中继",
        },
      },
    ],
  },

  {
    cat: "net", tool: "Redis CLI",
    entries: [
      {
        desc: "验证 LiveKit 节点是否注册到 Redis",
        cmd:  "redis-cli keys \"livekit*\"\nredis-cli keys \"node*\"",
        tags: ["集群"],
        example: {
          input:  "redis-cli keys 'livekit*'",
          output: "1) \"livekit:node:nd_server01\"\n2) \"livekit:node:nd_server02\"\n3) \"livekit:room:my-room\"\n4) \"livekit:egress:EG_abc123\"",
          explain:
            "livekit:node:nd_* → 每个 LiveKit 节点的心跳 key（TTL 通常 30s）\n" +
            "livekit:room:*    → 房间状态存储（参与者列表、track 信息）\n" +
            "livekit:egress:*  → Egress 任务状态\n" +
            "若 keys 为空 → LiveKit 未连接到此 Redis，检查 config.yaml 中 redis 配置",
        },
      },
      {
        desc: "查看 Egress 任务队列",
        cmd:  "redis-cli keys \"egress*\"\nredis-cli hgetall egress:<id>",
        tags: ["egress"],
        example: {
          input:  "redis-cli hgetall livekit:egress:EG_abc123",
          output: "1) \"status\"\n2) \"EGRESS_ACTIVE\"\n3) \"room_name\"\n4) \"my-room\"\n5) \"started_at\"\n6) \"1700000000000\"",
          explain:
            "status      → EGRESS_ACTIVE/COMPLETE/FAILED\n" +
            "room_name   → 关联房间\n" +
            "started_at  → 毫秒时间戳\n" +
            "若 key 不存在 → Egress 服务可能未连接到同一 Redis 实例",
        },
      },
      {
        desc: "检查 Redis 连通性",
        cmd:  "redis-cli -h localhost -p 6379 ping\n# → PONG",
        tags: ["连通"],
        example: {
          input:  "redis-cli -h localhost -p 6379 ping",
          output: "PONG",
          explain:
            "PONG → Redis 正常响应\n" +
            "若超时或 Connection refused → Redis 未启动或端口/地址配置错误\n" +
            "若 NOAUTH → Redis 设置了密码，需加 -a <password> 参数",
        },
      },
    ],
  },

  {
    cat: "net", tool: "websocat",
    entries: [
      {
        desc: "测试 LiveKit WebSocket 信令端口",
        cmd:  "websocat ws://localhost:7880\n# 能连上说明 WS 端口正常",
        tags: ["WS"],
        example: {
          input:  "websocat ws://localhost:7880",
          output: "# 连接成功后等待输入（服务端不会主动发文本）\n# 按 Ctrl+C 断开\n# 若连接失败：\nwebsocat: WebSocketError: Connection refused (os error 111)",
          explain:
            "连接成功无输出 → 正常，LiveKit WS 需要 token 才会进入房间协议\n" +
            "Connection refused → 服务未启动或端口不对\n" +
            "HTTP 426 Upgrade Required → 对端不支持 WebSocket 升级（不太可能）\n" +
            "用途：纯粹验证 TCP+WS 握手，不测业务逻辑",
        },
      },
      {
        desc: "带 token 连接（测试鉴权）",
        cmd:  "websocat \"ws://localhost:7880/rtc?access_token=$TOKEN\"",
        tags: ["WS", "auth"],
        example: {
          input:  "TOKEN=$(lk token create --api-key devkey --api-secret secret --join --room my-room --identity test --valid-for 1h)\nwebsocat \"ws://localhost:7880/rtc?access_token=$TOKEN\"",
          output: "# 连接成功后服务端推送 JoinResponse protobuf（二进制，终端显示乱码）\n# 乱码内包含：房间 SID、本地参与者信息、其他参与者列表\n# 正常断开后无报错",
          explain:
            "/rtc → LiveKit 信令 WebSocket 端点（区别于普通 WS 连接）\n" +
            "access_token → JWT，服务端用 api-secret 验证签名\n" +
            "二进制响应 → LiveKit 使用 protobuf over WebSocket，非文本协议\n" +
            "若返回 HTTP 403 → token 无效；若返回 HTTP 404 → 路径错误",
        },
      },
    ],
  },

  // ── 可观测性 ────────────────────────────────────────────
  {
    cat: "obs", tool: "Prometheus",
    entries: [
      {
        desc: "验证 /metrics 端点",
        cmd:  "curl http://localhost:6789/metrics | grep livekit",
        tags: ["指标"],
        example: {
          input:  "curl -s http://localhost:6789/metrics | grep livekit | head -20",
          output: "# HELP livekit_rooms_total Total number of active rooms\n# TYPE livekit_rooms_total gauge\nlivekit_rooms_total 3\n# HELP livekit_participants_total Total number of participants\nlivekit_participants_total{room=\"my-room\"} 5\nlivekit_packet_loss_percent{room=\"my-room\",participant=\"user1\"} 0.12",
          explain:
            "livekit_rooms_total        → 当前活跃房间数\n" +
            "livekit_participants_total → 各房间参与者数（label: room）\n" +
            "livekit_packet_loss_percent→ 各参与者丢包率，> 2% 需告警\n" +
            "端口 6789 → LiveKit 默认 Prometheus 抓取端口（config.yaml prometheus_port）\n" +
            "若 curl 超时 → 检查 prometheus_port 配置是否开启",
        },
      },
      {
        desc: "关键指标速查",
        cmd:  "livekit_rooms_total\nlivekit_participants_total\nlivekit_packet_loss_percent\nlivekit_nack_total\nlivekit_bytes_in_total\nlivekit_bytes_out_total",
        tags: ["指标"],
        example: {
          input:  "curl -s http://localhost:6789/metrics | grep -E 'livekit_(rooms|nack|bytes)'",
          output: "livekit_rooms_total 3\nlivekit_nack_total{room=\"my-room\"} 45\nlivekit_bytes_in_total{room=\"my-room\"} 157286400\nlivekit_bytes_out_total{room=\"my-room\"} 524288000",
          explain:
            "livekit_nack_total    → 累计 NACK 重传请求；突增说明网络丢包加剧\n" +
            "livekit_bytes_in_total → 总入站流量（上行，参与者推流）\n" +
            "livekit_bytes_out_total→ 总出站流量（下行，参与者订阅）\n" +
            "out/in 比 ≈ 订阅者数：如 6 人订阅 2 路流，out ≈ in × 3",
        },
      },
      {
        desc: "Egress Prometheus 指标",
        cmd:  "curl http://localhost:<egress_prom_port>/metrics \\\n  | grep egress",
        tags: ["egress", "指标"],
        example: {
          input:  "curl -s http://localhost:7889/metrics | grep egress",
          output: "egress_pipeline_active 2\negress_bytes_written_total{egress_id=\"EG_abc\"} 245366784\negress_duration_seconds{egress_id=\"EG_abc\"} 321.5",
          explain:
            "egress_pipeline_active    → 当前活跃录制/推流管道数\n" +
            "egress_bytes_written_total→ 已写入字节数（可估算文件大小）\n" +
            "egress_duration_seconds   → 已录制秒数\n" +
            "Egress 服务端口在 egress.yaml 中的 prometheus_port 字段配置",
        },
      },
    ],
  },

  {
    cat: "obs", tool: "Grafana Stack",
    entries: [
      {
        desc: "一键启动完整观测栈",
        cmd:  "docker compose -f observability/docker-compose.yml up -d\n# Grafana: http://localhost:3000\n# Prometheus: http://localhost:9091",
        tags: ["docker"],
        example: {
          input:  "docker compose -f observability/docker-compose.yml up -d",
          output: "[+] Running 3/3\n ✔ Container prometheus   Started  0.4s\n ✔ Container grafana      Started  0.5s\n ✔ Container loki         Started  0.3s",
          explain:
            "Prometheus  → 抓取 LiveKit /metrics，存储时序数据\n" +
            "Grafana     → 可视化面板，默认账号 admin/admin\n" +
            "Loki        → 日志聚合，配合 promtail 收集 LiveKit 日志\n" +
            "首次启动后导入 LiveKit 官方 Grafana Dashboard（ID: 16028）",
        },
      },
      {
        desc: "Agent LLM 延迟指标（AI pipeline）",
        cmd:  "livekit_llm_duration_ms\nlivekit_stt_duration_ms\nlivekit_tts_duration_ms\n# 在 Grafana 里建 histogram 面板",
        tags: ["agent", "AI"],
        example: {
          input:  "curl -s http://localhost:6789/metrics | grep -E '(llm|stt|tts)_duration'",
          output: "livekit_llm_duration_ms_bucket{le=\"500\"} 142\nlivekit_llm_duration_ms_bucket{le=\"1000\"} 289\nlivekit_llm_duration_ms_sum 187432\nlivekit_llm_duration_ms_count 312\nlivekit_stt_duration_ms_sum 45120\nlivekit_tts_duration_ms_sum 89340",
          explain:
            "histogram_bucket → 各延迟分位的请求计数\n" +
            "LLM p50 ≈ sum/count = 187432/312 ≈ 600ms（首 token 延迟）\n" +
            "STT（语音转文字）延迟应 < 300ms 以保证对话流畅\n" +
            "TTS（文字转语音）延迟应 < 500ms\n" +
            "Grafana 面板建议用 histogram_quantile(0.95, ...) 监控 P95 延迟",
        },
      },
    ],
  },

  {
    cat: "obs", tool: "grpcurl",
    entries: [
      {
        desc: "列出 gRPC 服务",
        cmd:  "grpcurl -plaintext localhost:7880 list",
        tags: ["grpc"],
        example: {
          input:  "grpcurl -plaintext localhost:7880 list",
          output: "livekit.RoomService\nlivekit.ParticipantService\nlivekit.EgressService\nlivekit.IngressService\nlivekit.SIPService\ngrpc.reflection.v1alpha.ServerReflection",
          explain:
            "列出服务前提：LiveKit 服务端开启了 gRPC reflection\n" +
            "RoomService        → 房间管理（创建/删除/列表）\n" +
            "ParticipantService → 参与者管理（踢出/静音/更新权限）\n" +
            "EgressService      → 录制/推流管理\n" +
            "IngressService     → 入流管理（RTMP/WHIP 输入源）\n" +
            "SIPService         → SIP Trunk/Dispatch Rule 管理",
        },
      },
      {
        desc: "查服务描述",
        cmd:  "grpcurl -plaintext localhost:7880 \\\n  describe livekit.RoomService",
        tags: ["grpc"],
        example: {
          input:  "grpcurl -plaintext localhost:7880 describe livekit.RoomService",
          output: "livekit.RoomService is a service:\nservice RoomService {\n  rpc CreateRoom ( .livekit.CreateRoomRequest ) returns ( .livekit.Room );\n  rpc ListRooms ( .livekit.ListRoomsRequest ) returns ( .livekit.ListRoomsResponse );\n  rpc DeleteRoom ( .livekit.DeleteRoomRequest ) returns ( .livekit.DeleteRoomResponse );\n  rpc ListParticipants ( .livekit.ListParticipantsRequest ) returns ( .livekit.ListParticipantsResponse );\n  rpc RemoveParticipant ( .livekit.RemoveParticipantRequest ) returns ( .livekit.RemoveParticipantResponse );\n  rpc MutePublishedTrack ( .livekit.MuteRoomTrackRequest ) returns ( .livekit.MuteRoomTrackResponse );\n}",
          explain:
            "每个 rpc 对应一个 Twirp HTTP 端点：/twirp/livekit.RoomService/<MethodName>\n" +
            "Request/Response 类型可进一步 describe 查看字段定义\n" +
            "grpcurl 本身也可直接调用这些方法（替代 curl + Twirp）",
        },
      },
    ],
  },

  // ── 媒体 / ffmpeg ───────────────────────────────────────
  {
    cat: "media", tool: "ffprobe",
    entries: [
      {
        desc: "探测录制文件编码参数",
        cmd:  "ffprobe -v quiet \\\n  -print_format json \\\n  -show_streams recording.mp4",
        tags: ["录制"],
        example: {
          input:  "ffprobe -v quiet -print_format json -show_streams recording.mp4",
          output: '{\n  "streams": [\n    {\n      "codec_type": "video",\n      "codec_name": "h264",\n      "width": 1280, "height": 720,\n      "r_frame_rate": "30/1",\n      "bit_rate": "2000000"\n    },\n    {\n      "codec_type": "audio",\n      "codec_name": "aac",\n      "sample_rate": "48000",\n      "channels": 2,\n      "bit_rate": "128000"\n    }\n  ]\n}',
          explain:
            "codec_name    → 视频编码（h264/vp8/vp9）；音频编码（aac/opus）\n" +
            "width/height  → 视频分辨率\n" +
            "r_frame_rate  → 帧率（30/1 = 30fps）\n" +
            "bit_rate      → 码率（bps）；2000000 = 2 Mbps 视频\n" +
            "sample_rate   → 音频采样率；48000 = 48kHz（Opus 标准）\n" +
            "channels      → 声道数（1=单声道，2=立体声）",
        },
      },
      {
        desc: "检查音频流采样率/codec",
        cmd:  "ffprobe -v quiet -show_streams \\\n  -select_streams a recording.mp4",
        tags: ["音频"],
        example: {
          input:  "ffprobe -v quiet -show_streams -select_streams a:0 recording.mp4",
          output: "[STREAM]\nindex=1\ncodec_name=aac\ncodec_long_name=AAC (Advanced Audio Coding)\nsample_rate=48000\nchannels=2\nchannel_layout=stereo\nbits_per_sample=0\nbit_rate=128000\n[/STREAM]",
          explain:
            "-select_streams a:0 → 只看第一条音频流\n" +
            "codec_name=aac      → Egress 录制默认转码为 AAC（MP4 容器兼容）\n" +
            "sample_rate=48000   → Opus 原始 48kHz 采样\n" +
            "若 codec_name=opus  → 录制为 WebM 格式时不转码\n" +
            "bit_rate=128000     → 128 Kbps 立体声 AAC，音质良好",
        },
      },
    ],
  },

  {
    cat: "media", tool: "ffmpeg → LiveKit",
    entries: [
      {
        desc: "编码视频为 ivf 格式（lk publish 用）",
        cmd:  "ffmpeg -i input.mp4 \\\n  -c:v libvpx-vp9 output.ivf",
        tags: ["编码"],
        example: {
          input:  "ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1M -an output.ivf",
          output: "ffmpeg version 6.0\nStream #0:0: Video: vp9, yuv420p, 1280x720, 30 fps\nframe=  900 fps= 45 time=00:00:30.00 bitrate=1024.0kbits/s speed=1.5x\nvideo:3840kB audio:0kB",
          explain:
            "-c:v libvpx-vp9 → 使用 VP9 编码（LiveKit lk publish 支持 VP8/VP9）\n" +
            "-b:v 1M         → 目标码率 1 Mbps\n" +
            "-an             → 不包含音频（IVF 只支持视频）\n" +
            "output.ivf      → IVF 容器，lk room join --publish 直接读取\n" +
            "speed=1.5x      → 编码速度，越高越快但质量可能下降",
        },
      },
      {
        desc: "编码音频为 ogg opus（lk publish 用）",
        cmd:  "ffmpeg -i input.mp4 \\\n  -c:a libopus output.ogg",
        tags: ["编码", "音频"],
        example: {
          input:  "ffmpeg -i input.mp4 -vn -c:a libopus -b:a 64k output.ogg",
          output: "Stream #0:0: Audio: opus, 48000 Hz, stereo, fltp\nsize=   240kB time=00:00:30.00 bitrate=  64.0kbits/s speed=  42x",
          explain:
            "-vn          → 丢弃视频流，只保留音频\n" +
            "-c:a libopus → Opus 编码（LiveKit 原生支持，无需服务端转码）\n" +
            "-b:a 64k     → 64 Kbps 单声道语音质量良好；128k 用于音乐\n" +
            "48000 Hz     → Opus 标准采样率，与 LiveKit WebRTC 一致\n" +
            "speed=42x    → 音频编码极快，不是瓶颈",
        },
      },
      {
        desc: "RTSP 源推流到 LiveKit（Unix socket）",
        cmd:  "ffmpeg -i rtsp://source \\\n  -c:v libx264 -bsf:v h264_mp4toannexb -b:v 2M \\\n  -profile:v baseline -pix_fmt yuv420p \\\n  -x264-params keyint=120 -max_delay 0 -bf 0 \\\n  -listen 1 -f h264 unix:/tmp/video.sock \\\n  -c:a libopus -page_duration 20000 -vn \\\n  -listen 1 -f opus unix:/tmp/audio.sock",
        tags: ["RTSP", "推流"],
        example: {
          input:  "# 第一步：启动 ffmpeg 监听（Unix socket 服务端）\nffmpeg -i rtsp://camera.local:554/stream ...\n\n# 第二步：lk 读取 socket\nlk room join --identity rtsp-pub \\\n  --publish unix:/tmp/video.sock \\\n  --publish unix:/tmp/audio.sock \\\n  my-room",
          output: "ffmpeg: Input #0, rtsp: 1280x720@25fps H264 + AAC\nOutput #0 (h264) → unix:/tmp/video.sock: listening\nOutput #1 (opus) → unix:/tmp/audio.sock: listening\n\nlk: Connected to my-room\nlk: Publishing video track TR_video_xxxx\nlk: Publishing audio track TR_audio_xxxx",
          explain:
            "Unix socket 方式避免 TCP 额外开销，适合同机 ffmpeg + lk 协作\n" +
            "-bsf:v h264_mp4toannexb → 将 H264 封装从 MP4(AVCC) 转为 Annex B（WebRTC 要求）\n" +
            "-profile:v baseline    → 兼容性最好的 H264 Profile\n" +
            "keyint=120             → 每 120 帧一个关键帧（25fps → 4.8秒），影响加入延迟\n" +
            "-bf 0                  → 禁用 B 帧，降低编解码延迟\n" +
            "-page_duration 20000   → Opus 页时长 20ms，匹配 WebRTC 音频帧",
        },
      },
      {
        desc: "播放 RTP dump（需 SDP 文件）",
        cmd:  "ffplay -protocol_whitelist rtp,udp,file test.sdp",
        tags: ["RTP", "播放"],
        example: {
          input:  "# test.sdp 内容：\nv=0\nm=video 5004 RTP/AVP 96\na=rtpmap:96 VP8/90000\nc=IN IP4 127.0.0.1\n\n# 播放命令：\nffplay -protocol_whitelist rtp,udp,file test.sdp",
          output: "ffplay version 6.0\nInput: rtp://127.0.0.1:5004\nStream: Video: vp8 1280x720\n# 弹出视频窗口播放 RTP 流",
          explain:
            "-protocol_whitelist → ffplay 默认禁用 rtp/udp 协议，需显式白名单\n" +
            "SDP 文件描述 RTP 会话参数（端口/编码/IP）\n" +
            "用途：验证 tshark/tcpdump 抓包的 RTP 流是否可正常解码\n" +
            "若无视频输出 → 检查 SDP 中的 IP/端口与实际抓包是否一致",
        },
      },
    ],
  },

  {
    cat: "media", tool: "httpie",
    entries: [
      {
        desc: "调 Twirp API（比 curl 更易读）",
        cmd:  "http POST localhost:7880/twirp/livekit.RoomService/ListRooms \\\n  Authorization:\"Bearer $TOKEN\" \\\n  Content-Type:application/json",
        tags: ["api"],
        example: {
          input:  "http POST localhost:7880/twirp/livekit.RoomService/ListRooms Authorization:\"Bearer $TOKEN\"",
          output: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n    "rooms": [\n        {\n            "name": "my-room",\n            "sid": "RM_abc123",\n            "numParticipants": 3\n        }\n    ]\n}',
          explain:
            "httpie 自动添加 Content-Type: application/json，无需手动指定\n" +
            "响应格式化 JSON 输出，比 curl + jq 更方便\n" +
            "HTTP 200 → 正常；HTTP 401 → token 鉴权失败；HTTP 404 → 端点路径错误",
        },
      },
      {
        desc: "踢出参与者",
        cmd:  "http POST localhost:7880/twirp/livekit.RoomService/RemoveParticipant \\\n  Authorization:\"Bearer $TOKEN\" \\\n  room=my-room identity=user1",
        tags: ["api", "管理"],
        example: {
          input:  "http POST localhost:7880/twirp/livekit.RoomService/RemoveParticipant Authorization:\"Bearer $TOKEN\" room=my-room identity=user1",
          output: "HTTP/1.1 200 OK\n\n{}",
          explain:
            "返回空 {} → 踢出成功（Twirp 惯例）\n" +
            "被踢参与者的客户端会收到 ParticipantDisconnected 事件并断开连接\n" +
            "需要 token 有 roomAdmin 权限（--room-admin），否则返回 403",
        },
      },
    ],
  },
];
