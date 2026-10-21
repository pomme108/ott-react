# 스포츠 페이지 연결

`/sports`는 MLB 공개 Schedule API에서 미국 동부 기준 오늘 경기를 30초마다 갱신합니다. 표시는 한국 시간입니다. 진행 중인 경기가 우선 노출됩니다. 실제 경기가 없거나 API 연결이 실패하면 6개의 **예시 경기**를 표시합니다. 예시를 실제 생중계로 표시하지 않으며 예시 경기 채팅은 비활성화됩니다. 실제 경기 수는 당일 일정에 따라 5개 미만일 수 있습니다.

## 방송

방송 사용 권한이 있는 HTTPS 임베드/영상 주소를 `.env.local`에 등록하고 Vite를 재시작합니다. 키는 MLB의 gamePk입니다. 비밀 토큰은 VITE 변수에 넣지 마세요. 이 변수는 브라우저에 공개됩니다.

```dotenv
VITE_SPORTS_STREAMS='{"123456":{"type":"embed","url":"https://your-authorized-provider.example/embed/game"}}'
```

`type: "video"`는 브라우저가 직접 재생할 수 있는 파일/스트림을 사용합니다. HLS는 브라우저의 네이티브 지원이 필요합니다. 방송 제공자는 iframe 임베딩 및 앱 도메인을 허용해야 합니다. 주소가 없는 경기는 대기 화면을 표시합니다. MLB 일정 API는 영상 방송을 제공하지 않습니다.

## 경기별 실제 채팅

기존 Firebase 프로젝트와 Google 로그인을 사용합니다. Firestore `sportsRooms/{gamePk}/messages`에 메시지를 저장하고 최신 100개를 실시간 구독합니다. 다른 기기에서도 동일한 경기 방을 사용합니다. 예시 메시지나 가짜 접속자 수는 표시하지 않습니다. Google 로그인 활성화 및 실행 도메인의 Firebase Authentication 승인 도메인 등록이 필요합니다.

기존 Firestore 보안 규칙을 검토해 아래 match를 **병합**하세요. 기존 규칙 전체를 덮어쓰거나 전체 DB를 공개하지 마세요. 이 파일은 규칙을 배포하지 않습니다.

```javascript
match /sportsRooms/{roomId}/messages/{messageId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && roomId.matches('^[0-9]+$')
    && request.resource.data.keys().hasOnly(['uid', 'name', 'text', 'createdAt'])
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.name.size() <= 40
    && request.resource.data.text is string
    && request.resource.data.text.size() > 0
    && request.resource.data.text.size() <= 300
    && request.resource.data.createdAt == request.time;
  allow update, delete: if false;
}
```

운영 배포 시 App Check, 스팸 방지 및 신고/관리 정책도 서비스 요구에 맞게 구성하세요. 네트워크 정책에는 statsapi.mlb.com, firestore.googleapis.com, identitytoolkit.googleapis.com, securetoken.googleapis.com, accounts.google.com 및 사용하는 Firebase 인증 도메인/방송 제공 도메인이 필요합니다.

## 검증

`npm run build` 및 새 파일에 대한 `npx eslint src/pages/Sports.jsx src/features/sports/*.js src/features/sports/*.jsx`를 실행합니다. 브라우저에서 메뉴 마지막의 스포츠, 경기 선택, 실시간 필터, 모바일 레이아웃을 확인합니다. 실제 연결 검증은 승인된 방송 주소와 Firebase 규칙 배포 후 두 개의 다른 로그인 세션으로 같은 경기에서 메시지가 동기화되는지 확인해야 합니다.

방송 주소가 없으면 외부 영상 대신 Canvas로 직접 제작한 야구 시뮬레이션을 재생합니다. 투구·타격·주루 장면 및 점수는 모두 가상이며 실제 경기와 무관합니다. 재생/일시정지 버튼을 제공합니다.
