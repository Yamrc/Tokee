import { render } from 'solid-js/web';
import 'solid-devtools';

import 'overlayscrollbars/overlayscrollbars.css';

import './style/index.css';
import App from './App';

console.debug(`
く__,.ヘヽ.        /  ,ー､ 〉
         ＼ ', !-─‐-i  /  /´
         ／｀ｰ'       L/／｀ヽ､
       /   ／,   /|   ,   ,       ',
     ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
      ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
        !,/7 '0'     ´0iソ|    |
        |.从"    _     ,,,, / |./    |
        ﾚ'| i＞.､,,__  _,.イ /   .i   |
          ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
            | |/i 〈|/   i  ,.ﾍ |  i  |
           .|/ /  ｉ：    ﾍ!    ＼  |
            kヽ>､ﾊ    _,.ﾍ､    /､!
            !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
            ﾚ'ヽL__|___i,___,ンﾚ|ノ
                ﾄ-,/  |___./
                'ｰ'    !_,.:
%cHello from Tokee%cv2.0.0`, "padding:2px 6px;border-radius:3px 0 0 3px;color:#fff;background:#FF6699;font-weight: bold;", "padding:2px 6px;border-radius:0 3px 3px 0;color:#fff;background:#FF9999;font-weight: bold;");

render(() => <App />, document.getElementById('root')!);

const initOverlayScrollbars = async () => {
	if (!document.body) return;
	const { OverlayScrollbars } = await import('overlayscrollbars');
	OverlayScrollbars(document.body, {
		scrollbars: {
			theme: 'scrollbar-base scrollbar-auto py-1',
			autoHide: 'move',
			autoHideDelay: 500,
			autoHideSuspend: false,
		},
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => initOverlayScrollbars());
} else {
	initOverlayScrollbars();
}
