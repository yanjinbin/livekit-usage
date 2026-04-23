export type Category = "lk" | "sip" | "rtp" | "net" | "obs" | "media";

export interface Entry {
  desc: string;
  cmd: string;
  tags: string[];
}

export interface Card {
  cat: Category;
  tool: string;
  entries: Entry[];
}

export const CATEGORY_COLORS: Record<Category, string> = {
  lk: "var(--lk)",
  sip: "var(--sip)",
  rtp: "var(--rtp)",
  net: "var(--net)",
  obs: "var(--obs)",
  media: "var(--media)",
};

export const CATEGORY_TAG_STYLES: Record<Category, string> = {
  lk: "background:rgba(0,212,170,.1);color:var(--lk)",
  sip: "background:rgba(255,107,107,.1);color:var(--sip)",
  rtp: "background:rgba(79,195,247,.1);color:var(--rtp)",
  net: "background:rgba(255,213,79,.1);color:var(--net)",
  obs: "background:rgba(206,147,216,.1);color:var(--obs)",
  media: "background:rgba(129,199,132,.1);color:var(--media)",
};

export const CATEGORY_LABELS: Record<Category | "all", string> = {
  all: "全部",
  lk: "lk CLI",
  sip: "SIP / sngrep",
  rtp: "RTP / Wireshark",
  net: "网络 / 诊断",
  obs: "可观测性",
  media: "媒体 / ffmpeg",
};

export const data: Card[] = [
  // ── lk CLI ──────────────────────────────────────────────
  {
    cat: "lk",
    tool: "lk room",
    entries: [
      {
        desc: "列出所有房间",
        cmd: "lk room list --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret",
        tags: ["基础"],
      },
      {
        desc: "加入房间（模拟参与者）",
        cmd: "lk room join --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret \\\n  --identity bot my-room",
        tags: ["测试"],
      },
      {
        desc: "发布 demo 视频进入房间",
        cmd: "lk room join --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret \\\n  --identity bot --publish-demo my-room",
        tags: ["媒体", "测试"],
      },
      {
        desc: "发布自定义音视频文件",
        cmd: "lk room join --identity pub \\\n  --publish video.ivf --publish audio.ogg \\\n  --fps 30 my-room",
        tags: ["媒体"],
      },
      {
        desc: "删除房间",
        cmd: "lk room delete --url ws://localhost:7880 \\\n  --api-key devkey --api-secret secret my-room",
        tags: ["管理"],
      },
    ],
  },
  {
    cat: "lk",
    tool: "lk token",
    entries: [
      {
        desc: "生成加入房间的 token",
        cmd: "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --join --room my-room --identity user1 \\\n  --valid-for 24h",
        tags: ["auth"],
      },
      {
        desc: "生成有 roomList 权限的 token（调 Twirp API 用）",
        cmd: "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --room-list --valid-for 1h",
        tags: ["auth", "api"],
      },
      {
        desc: "生成 roomAdmin 权限 token（踢人/静音）",
        cmd: "lk token create \\\n  --api-key devkey --api-secret secret \\\n  --room-admin --room my-room --valid-for 1h",
        tags: ["auth", "管理"],
      },
    ],
  },
  {
    cat: "lk",
    tool: "lk load-test",
    entries: [
      {
        desc: "压测：8 视频发布 + 500 订阅",
        cmd: "lk load-test --room test-room \\\n  --video-publishers 8 \\\n  --subscribers 500 --duration 1m",
        tags: ["压测"],
      },
      {
        desc: "压测：5 路并发音频发言",
        cmd: "lk load-test --room test-room \\\n  --audio-publishers 5",
        tags: ["压测", "音频"],
      },
      {
        desc: "压测并打开 Meet 观察结果",
        cmd: "lk load-test --room test-room \\\n  --video-publishers 4 --open",
        tags: ["压测"],
      },
    ],
  },
  {
    cat: "lk",
    tool: "lk egress",
    entries: [
      {
        desc: "查看当前 Egress 任务",
        cmd: "lk egress list --room my-room",
        tags: ["录制"],
      },
      {
        desc: "停止指定 Egress 任务",
        cmd: "lk egress stop --egress-id EG_xxxx",
        tags: ["录制"],
      },
    ],
  },
  {
    cat: "lk",
    tool: "Twirp curl",
    entries: [
      {
        desc: "列出所有房间（curl）",
        cmd: 'curl -X POST http://localhost:7880/twirp/livekit.RoomService/ListRooms \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d \'{}\'',
        tags: ["api"],
      },
      {
        desc: "查某房间的参与者",
        cmd: 'curl -X POST http://localhost:7880/twirp/livekit.RoomService/ListParticipants \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"room":"my-room"}\'',
        tags: ["api"],
      },
      {
        desc: "强制删除房间",
        cmd: 'curl -X POST http://localhost:7880/twirp/livekit.RoomService/DeleteRoom \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"room":"my-room"}\'',
        tags: ["api", "管理"],
      },
      {
        desc: "查 Egress 任务状态",
        cmd: 'curl -X POST http://localhost:7880/twirp/livekit.EgressService/ListEgress \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d \'{"room_name":"my-room"}\'',
        tags: ["api", "录制"],
      },
      {
        desc: "Twirp 错误码速查",
        cmd: "unavailable    → Egress/SIP 没连上 Redis\nunauthenticated → token 过期或无权限\nnot_found       → room/participant 不存在\ninvalid_argument → 请求 body 字段有误",
        tags: ["错误码"],
      },
    ],
  },

  // ── SIP / sngrep ────────────────────────────────────────
  {
    cat: "sip",
    tool: "sngrep",
    entries: [
      {
        desc: "实时抓 SIP 信令（梯形图）",
        cmd: "sngrep",
        tags: ["实时"],
      },
      { desc: "只抓 5060 端口", cmd: "sngrep port 5060", tags: ["实时"] },
      {
        desc: "抓指定 carrier IP",
        cmd: "sngrep host <carrier-ip> port 5060",
        tags: ["实时"],
      },
      {
        desc: "抓包同时存文件",
        cmd: "sngrep -O capture.pcap",
        tags: ["存档"],
      },
      {
        desc: "读取已有 pcap 离线分析",
        cmd: "sngrep -I capture.pcap",
        tags: ["离线"],
      },
      {
        desc: "只看 INVITE 事务",
        cmd: "sngrep port 5060\n# 启动后按 F7 过滤 INVITE",
        tags: ["过滤"],
      },
    ],
  },
  {
    cat: "sip",
    tool: "SIP 排障",
    entries: [
      {
        desc: "入向呼叫不进房间 → 看 INVITE 是否到达",
        cmd: "sngrep port 5060\n# 确认看到 INVITE → 100 Trying → 180 Ringing",
        tags: ["入向"],
      },
      {
        desc: "有通话无音频 → 看 SDP 里的 c= 和 m= 行",
        cmd: "sngrep port 5060\n# Enter 展开消息体\n# c=IN IP4 <ip>   ← RTP 目标 IP\n# m=audio <port>  ← RTP 端口",
        tags: ["无声", "SDP"],
      },
      {
        desc: "出向呼叫 carrier 无响应",
        cmd: "sngrep host <carrier-ip>\n# 看有没有 100 Trying 回来",
        tags: ["出向"],
      },
    ],
  },

  // ── RTP / Wireshark ─────────────────────────────────────
  {
    cat: "rtp",
    tool: "Wireshark",
    entries: [
      {
        desc: "RTP 流过滤器",
        cmd: "rtp || rtcp || stun || dtls",
        tags: ["过滤"],
      },
      {
        desc: "RTP 流统计（丢包/jitter 曲线）",
        cmd: "Telephony → RTP → RTP Streams → Analyze",
        tags: ["统计"],
      },
      {
        desc: "RTCP 分析（发送端/接收端报告）",
        cmd: "Telephony → RTP → RTCP Statistics",
        tags: ["统计"],
      },
      {
        desc: "tshark 命令行抓 RTP 字段",
        cmd: "tshark -i any \\\n  -Y rtp \\\n  -T fields \\\n  -e rtp.seq -e rtp.timestamp -e rtp.p_type",
        tags: ["命令行"],
      },
      {
        desc: "tshark 抓 LiveKit UDP 媒体端口",
        cmd: "tshark -i any \\\n  -f \"udp portrange 50000-60000\" \\\n  -w livekit_rtp.pcap",
        tags: ["命令行", "存档"],
      },
    ],
  },
  {
    cat: "rtp",
    tool: "WebRTC Internals",
    entries: [
      {
        desc: "打开 Chrome WebRTC 调试页",
        cmd: "chrome://webrtc-internals",
        tags: ["browser"],
      },
      {
        desc: "查 ICE 连接状态",
        cmd: "# RTCIceCandidatePair\n→ state: succeeded / failed\n→ currentRoundTripTime (RTT)",
        tags: ["ICE"],
      },
      {
        desc: "查视频丢包 / 帧率",
        cmd: "# RTCInboundRtpVideoStream\n→ packetsLost\n→ framesDecoded\n→ framesPerSecond",
        tags: ["视频"],
      },
      {
        desc: "查音频 jitter",
        cmd: "# RTCInboundRtpAudioStream\n→ jitter\n→ audioLevel\n→ totalSamplesReceived",
        tags: ["音频"],
      },
    ],
  },

  // ── 网络诊断 ────────────────────────────────────────────
  {
    cat: "net",
    tool: "lsof / ss",
    entries: [
      {
        desc: "查 LiveKit 端口占用",
        cmd: "lsof -i :7880\nlsof -i :7881\nlsof -i :5060",
        tags: ["端口"],
      },
      {
        desc: "查 UDP 媒体端口是否监听",
        cmd: "lsof -i UDP | grep livekit",
        tags: ["UDP"],
      },
    ],
  },
  {
    cat: "net",
    tool: "mtr / nmap",
    entries: [
      {
        desc: "诊断到 LiveKit Cloud 的路径",
        cmd: "mtr --report cloud.livekit.io",
        tags: ["延迟"],
      },
      {
        desc: "确认 LiveKit 端口是否对外开放",
        cmd: "nmap -p 7880,7881,5060 <server-ip>",
        tags: ["端口"],
      },
      {
        desc: "扫 UDP 媒体端口范围",
        cmd: "nmap -sU -p 50000-50010 <server-ip>",
        tags: ["UDP", "端口"],
      },
    ],
  },
  {
    cat: "net",
    tool: "Redis CLI",
    entries: [
      {
        desc: "验证 LiveKit 节点是否注册到 Redis",
        cmd: 'redis-cli keys "livekit*"\nredis-cli keys "node*"',
        tags: ["集群"],
      },
      {
        desc: "查看 Egress 任务队列",
        cmd: 'redis-cli keys "egress*"\nredis-cli hgetall egress:<id>',
        tags: ["egress"],
      },
      {
        desc: "检查 Redis 连通性",
        cmd: "redis-cli -h localhost -p 6379 ping\n# → PONG",
        tags: ["连通"],
      },
    ],
  },
  {
    cat: "net",
    tool: "websocat",
    entries: [
      {
        desc: "测试 LiveKit WebSocket 信令端口",
        cmd: "websocat ws://localhost:7880\n# 能连上说明 WS 端口正常",
        tags: ["WS"],
      },
      {
        desc: "带 token 连接（测试鉴权）",
        cmd: 'websocat "ws://localhost:7880/rtc?access_token=$TOKEN"',
        tags: ["WS", "auth"],
      },
    ],
  },

  // ── 可观测性 ────────────────────────────────────────────
  {
    cat: "obs",
    tool: "Prometheus",
    entries: [
      {
        desc: "验证 /metrics 端点",
        cmd: "curl http://localhost:6789/metrics | grep livekit",
        tags: ["指标"],
      },
      {
        desc: "关键指标速查",
        cmd: "livekit_rooms_total\nlivekit_participants_total\nlivekit_packet_loss_percent\nlivekit_nack_total\nlivekit_bytes_in_total\nlivekit_bytes_out_total",
        tags: ["指标"],
      },
      {
        desc: "Egress Prometheus 指标",
        cmd: "curl http://localhost:<egress_prom_port>/metrics \\\n  | grep egress",
        tags: ["egress", "指标"],
      },
    ],
  },
  {
    cat: "obs",
    tool: "Grafana Stack",
    entries: [
      {
        desc: "一键启动完整观测栈",
        cmd: "docker compose -f observability/docker-compose.yml up -d\n# Grafana: http://localhost:3000\n# Prometheus: http://localhost:9091",
        tags: ["docker"],
      },
      {
        desc: "Agent LLM 延迟指标（AI pipeline）",
        cmd: "livekit_llm_duration_ms\nlivekit_stt_duration_ms\nlivekit_tts_duration_ms\n# 在 Grafana 里建 histogram 面板",
        tags: ["agent", "AI"],
      },
    ],
  },
  {
    cat: "obs",
    tool: "grpcurl",
    entries: [
      {
        desc: "列出 gRPC 服务（LiveKit 内部 psrpc）",
        cmd: "grpcurl -plaintext localhost:7880 list",
        tags: ["grpc"],
      },
      {
        desc: "查服务描述",
        cmd: "grpcurl -plaintext localhost:7880 \\\n  describe livekit.RoomService",
        tags: ["grpc"],
      },
    ],
  },

  // ── 媒体 / ffmpeg ───────────────────────────────────────
  {
    cat: "media",
    tool: "ffprobe",
    entries: [
      {
        desc: "探测录制文件编码参数",
        cmd: "ffprobe -v quiet \\\n  -print_format json \\\n  -show_streams recording.mp4",
        tags: ["录制"],
      },
      {
        desc: "检查音频流采样率/codec",
        cmd: "ffprobe -v quiet -show_streams \\\n  -select_streams a recording.mp4",
        tags: ["音频"],
      },
    ],
  },
  {
    cat: "media",
    tool: "ffmpeg → LiveKit",
    entries: [
      {
        desc: "编码视频为 ivf 格式（lk publish 用）",
        cmd: "ffmpeg -i input.mp4 \\\n  -c:v libvpx-vp9 output.ivf",
        tags: ["编码"],
      },
      {
        desc: "编码音频为 ogg opus（lk publish 用）",
        cmd: "ffmpeg -i input.mp4 \\\n  -c:a libopus output.ogg",
        tags: ["编码", "音频"],
      },
      {
        desc: "RTSP 源推流到 LiveKit（Unix socket 方式）",
        cmd: "ffmpeg -i rtsp://source \\\n  -c:v libx264 -bsf:v h264_mp4toannexb -b:v 2M \\\n  -profile:v baseline -pix_fmt yuv420p \\\n  -x264-params keyint=120 -max_delay 0 -bf 0 \\\n  -listen 1 -f h264 unix:/tmp/video.sock \\\n  -c:a libopus -page_duration 20000 -vn \\\n  -listen 1 -f opus unix:/tmp/audio.sock",
        tags: ["RTSP", "推流"],
      },
      {
        desc: "播放 RTP dump（需 SDP 文件）",
        cmd: "ffplay -protocol_whitelist rtp,udp,file test.sdp",
        tags: ["RTP", "播放"],
      },
    ],
  },
  {
    cat: "media",
    tool: "httpie",
    entries: [
      {
        desc: "调 Twirp API（比 curl 更易读）",
        cmd: 'http POST localhost:7880/twirp/livekit.RoomService/ListRooms \\\n  Authorization:"Bearer $TOKEN" \\\n  Content-Type:application/json',
        tags: ["api"],
      },
      {
        desc: "踢出参与者",
        cmd: 'http POST localhost:7880/twirp/livekit.RoomService/RemoveParticipant \\\n  Authorization:"Bearer $TOKEN" \\\n  room=my-room identity=user1',
        tags: ["api", "管理"],
      },
    ],
  },
];
