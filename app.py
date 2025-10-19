from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- Route untuk Halaman Utama & Tentang ---

@app.route('/')
def home():
    """Menyajikan halaman utama web profil (index.html)."""
    return render_template('index.html')

@app.route('/tentang.html')
def tentang():
    """Menyajikan halaman 'Tentang Kami'."""
    return render_template('tentang.html')

# --- Route untuk Aplikasi RailBot ---

@app.route('/railbot/')
def railbot_index():
    """Menyajikan halaman utama aplikasi RailBot."""
    return render_template('railbot/index.html')

# Rute ini ditambahkan untuk menangani jika pengguna mengetik path lengkap
@app.route('/railbot/index.html')
def railbot_index_explicit():
    return railbot_index()

@app.route('/railbot/login.html')
def railbot_login():
    """Menyajikan halaman login RailBot."""
    return render_template('railbot/login.html')

@app.route('/railbot/profile.html')
def railbot_profile():
    """Menyajikan halaman profil pengguna."""
    return render_template('railbot/profile.html')

@app.route('/railbot/users.html')
def railbot_users():
    """Menyajikan halaman manajemen pengguna (admin)."""
    return render_template('railbot/users.html')

# --- Route Khusus untuk Aset di Subfolder Railbot ---
# Diperlukan agar path seperti 'logo/icon.ico' di file HTML railbot bisa ditemukan
@app.route('/railbot/logo/<path:filename>')
def railbot_logo(filename):
    """Menyajikan file dari folder logo di dalam static."""
    return send_from_directory(os.path.join(app.static_folder, 'logo'), filename)


if __name__ == '__main__':
    # Menjalankan server Flask
    # host='0.0.0.0' membuatnya dapat diakses dari perangkat lain di jaringan yang sama
    app.run(debug=True, host='0.0.0.0', port=5000)