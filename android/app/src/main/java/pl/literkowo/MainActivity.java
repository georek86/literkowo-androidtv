package pl.literkowo;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    // Track whether the system IME is currently visible to avoid hideSystemUI() loop
    private boolean imeVisible = false;

    /** Returns true if the soft keyboard is currently active (accepting input). */
    private boolean isImeActive() {
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        return imm != null && imm.isActive();
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void showSystemKeyboard() {
            mainHandler.post(() -> {
                if (webView == null) return;
                // Step 1: focus the editable input inside WebView so Android WebView
                // knows which element owns the IME connection.
                webView.evaluateJavascript(
                    "(function(){" +
                    "  var el=document.getElementById('system-ime-input');" +
                    "  if(el){el.focus();el.click();}" +
                    "})()", null);
                // Step 2: after WebView has processed the focus event, force-show IME.
                // Two attempts with different delays to handle slow WebView scheduling.
                mainHandler.postDelayed(() -> forceShowIme(), 120);
                mainHandler.postDelayed(() -> forceShowIme(), 400);
            });
        }

        private void forceShowIme() {
            if (webView == null) return;
            webView.requestFocus();
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.showSoftInput(webView, InputMethodManager.SHOW_FORCED);
            }
        }

        @JavascriptInterface
        public void hideSystemKeyboard() {
            mainHandler.post(() -> {
                if (webView != null) {
                    InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    if (imm != null) {
                        imm.hideSoftInputFromWindow(webView.getWindowToken(), 0);
                    }
                    // Restore immersive mode now that IME is gone
                    mainHandler.postDelayed(() -> hideSystemUI(), 200);
                }
            });
        }

        @JavascriptInterface
        public void toggleSystemKeyboard() {
            mainHandler.post(() -> {
                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm != null) {
                    imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
                }
            });
        }

        @JavascriptInterface
        public boolean isAndroidApp() {
            return true;
        }
    }

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen awake while playing
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Fullscreen window feature
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        // Allow webview to adjust resize when soft keyboard appears
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webview);

        hideSystemUI();

        // Enable focus and touch input for software and hardware keyboards
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Viewport scaling: useWideViewPort allows viewport meta tag, overviewMode false ensures 1:1 CSS scaling
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());

        // Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Detect IME open/close via layout height change
        webView.post(() -> installImeDetector());

        // Load offline local assets
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        // Note: HIDE_NAVIGATION is intentionally omitted — it conflicts with adjustResize
        // and blocks the soft keyboard from resizing the window on many devices.
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    /**
     * Install a layout listener that detects IME open/close by measuring the root
     * view height change, and notifies JS so it can scroll the dock into view.
     * Also prevents hideSystemUI() from dismissing the keyboard in a focus loop.
     */
    private void installImeDetector() {
        final View rootView = getWindow().getDecorView().getRootView();
        rootView.getViewTreeObserver().addOnGlobalLayoutListener(() -> {
            int heightDiff = rootView.getRootView().getHeight() - rootView.getHeight();
            boolean nowVisible = heightDiff > 200; // more than 200px gap == IME is open
            if (nowVisible != imeVisible) {
                imeVisible = nowVisible;
                if (webView != null) {
                    final String js = imeVisible
                        ? "window.dispatchEvent(new CustomEvent('ime-show'));"
                        : "window.dispatchEvent(new CustomEvent('ime-hide'));";
                    webView.evaluateJavascript(js, null);
                }
                if (!imeVisible) {
                    // IME closed — restore immersive mode
                    mainHandler.postDelayed(() -> hideSystemUI(), 150);
                }
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && !imeVisible) {
            // Only re-apply immersive mode if the keyboard is NOT open.
            // If we call hideSystemUI() while IME is visible, some devices
            // dismiss the keyboard and re-trigger a focus-change loop.
            hideSystemUI();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function() {" +
                "  const ev = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true });" +
                "  window.dispatchEvent(ev);" +
                "})()", null);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Let volume keys control system music volume directly
        if (event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_UP ||
            event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_DOWN ||
            event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_MUTE) {
            return super.dispatchKeyEvent(event);
        }

        return super.dispatchKeyEvent(event);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        hideSystemUI();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
