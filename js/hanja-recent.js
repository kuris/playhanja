/* ============================================================
   한자야 놀자! - 내 학습 이력 패널 (hanja-recent.js)

   [이 파일이 하는 일]
     로그인한 사용자에게 "최근 외운 한자"와 "최근 시험 결과"를 보여 줍니다.
     데이터는 이미 hanja.learn_progress / hanja.quiz_results 에 쌓이고 있어서,
     새로 저장하는 것은 없고 읽어서 보여 주기만 합니다.

   [비로그인 사용자]
     서버 호출이 일어나지 않고, 안내 문구와 로그인 버튼만 보입니다.
     학습·퀴즈 기능은 지금과 100% 동일합니다.

   의존성: cg-auth.js (window.CGAuth)
   ============================================================ */

(function () {
  'use strict';

  function CG() { return window.CGAuth || null; }

  // ---------- item_id → 사람이 읽을 수 있는 이름 ----------
  var lookup = null;
  function buildLookup() {
    if (lookup) return lookup;
    lookup = {};
    try {
      (window.HANZI_DATA || []).forEach(function (h) {
        if (h && h.id) lookup[h.id] = { title: h.char + ' ' + (h.meaning || '') + ' ' + (h.sound || ''), url: 'learn.html' };
      });
      (window.IDIOMS || []).forEach(function (it) {
        if (it && it.id) lookup[it.id] = { title: (it.hanja || it.word || it.id) + ' ' + (it.meaning || ''), url: 'idiom.html' };
      });
      (window.GRADE_HANJA || []).forEach(function (g) {
        if (g && g.id && !lookup[g.id]) lookup[g.id] = { title: (g.char || g.id) + ' ' + (g.meaning || ''), url: 'grade.html' };
      });
    } catch (e) { /* 데이터가 없는 페이지에서는 그냥 원본 id 를 보여 줍니다 */ }
    return lookup;
  }

  function labelFor(itemId) {
    var t = buildLookup()[itemId];
    if (t) return t;
    return { title: String(itemId), url: 'learn.html' };
  }

  // ---------- 패널 ----------
  function mount() {
    if (!CG() || !CGAuth.mountRecentPanel) return;

    var learnHost = document.getElementById('hanja-recent');
    if (learnHost) {
      CGAuth.mountRecentPanel(learnHost, {
        title: '📖 최근 외운 한자',
        moreUrl: 'login.html',
        guestText: 'Google 로그인하면 외운 한자와 시험 기록이 계정에 저장돼, 휴대폰에서 공부하고 PC에서 이어서 볼 수 있어요.',
        emptyText: '아직 외운 한자가 없어요. 학습을 시작하면 여기에 쌓입니다.',
        loader: async function () {
          var rows = await CGAuth.listHistory('learn_progress', {
            schema: 'hanja', orderBy: 'learned_at', limit: 8
          });
          return rows.map(function (r) {
            var t = labelFor(r.item_id);
            return { title: t.title, url: t.url, updated_at: r.learned_at };
          });
        }
      });
    }

    var quizHost = document.getElementById('hanja-recent-quiz');
    if (quizHost) {
      CGAuth.mountRecentPanel(quizHost, {
        title: '📝 최근 시험 결과',
        moreUrl: 'login.html',
        guestText: 'Google 로그인하면 급수 시험 점수와 오답이 계정에 보관됩니다.',
        emptyText: '아직 본 시험이 없어요. 퀴즈나 급수 시험을 한 번 풀어 보세요.',
        loader: async function () {
          var rows = await CGAuth.listHistory('quiz_results', {
            schema: 'hanja', orderBy: 'created_at', limit: 6
          });
          return rows.map(function (r) {
            var name = r.mode === 'grade' ? (r.grade + '급 시험')
                     : r.mode === 'idiom' ? '고사성어 퀴즈'
                     : '한자 퀴즈';
            return {
              title: name + ' · ' + r.score + '/' + r.total + ' (' + r.percent + '%)',
              subtitle: r.passed ? '합격' : '',
              url: 'login.html',
              created_at: r.created_at
            };
          });
        }
      });
    }
  }

  function start() {
    if (!CG()) return;
    mount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
