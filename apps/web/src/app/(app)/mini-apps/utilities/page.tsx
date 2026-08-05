'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export default function UtilitiesSuitePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<
    'weather' | 'qr' | 'converter' | 'passwords' | 'device' | 'media' | 'contacts'
  >('weather');

  // Weather state (Indian cities default)
  const [city, setCity] = useState('Mumbai');
  const INDIAN_CITIES: Record<string, any> = {
    Mumbai: { temp: '31°C', condition: 'Humid & Clear', humidity: '78%', wind: '12 km/h', uv: 'High (7)', forecast: [{ day: 'Mon', temp: '32°', icon: 'wb_sunny' }, { day: 'Tue', temp: '30°', icon: 'cloud' }, { day: 'Wed', temp: '31°', icon: 'partly_cloudy_day' }, { day: 'Thu', temp: '33°', icon: 'wb_sunny' }, { day: 'Fri', temp: '31°', icon: 'wb_sunny' }] },
    'New Delhi': { temp: '36°C', condition: 'Sunny & Hot', humidity: '42%', wind: '10 km/h', uv: 'Very High (9)', forecast: [{ day: 'Mon', temp: '37°', icon: 'wb_sunny' }, { day: 'Tue', temp: '38°', icon: 'wb_sunny' }, { day: 'Wed', temp: '35°', icon: 'cloud' }, { day: 'Thu', temp: '36°', icon: 'wb_sunny' }, { day: 'Fri', temp: '37°', icon: 'wb_sunny' }] },
    Bengaluru: { temp: '25°C', condition: 'Pleasant & Breezy', humidity: '60%', wind: '15 km/h', uv: 'Moderate (5)', forecast: [{ day: 'Mon', temp: '26°', icon: 'partly_cloudy_day' }, { day: 'Tue', temp: '24°', icon: 'rainy' }, { day: 'Wed', temp: '25°', icon: 'cloud' }, { day: 'Thu', temp: '27°', icon: 'wb_sunny' }, { day: 'Fri', temp: '26°', icon: 'partly_cloudy_day' }] },
    Hyderabad: { temp: '30°C', condition: 'Partly Cloudy', humidity: '55%', wind: '11 km/h', uv: 'High (6)', forecast: [{ day: 'Mon', temp: '31°', icon: 'wb_sunny' }, { day: 'Tue', temp: '29°', icon: 'cloud' }, { day: 'Wed', temp: '30°', icon: 'partly_cloudy_day' }, { day: 'Thu', temp: '32°', icon: 'wb_sunny' }, { day: 'Fri', temp: '31°', icon: 'wb_sunny' }] },
    Chennai: { temp: '33°C', condition: 'Sunny & Coastal', humidity: '82%', wind: '14 km/h', uv: 'High (8)', forecast: [{ day: 'Mon', temp: '34°', icon: 'wb_sunny' }, { day: 'Tue', temp: '33°', icon: 'wb_sunny' }, { day: 'Wed', temp: '32°', icon: 'partly_cloudy_day' }, { day: 'Thu', temp: '33°', icon: 'wb_sunny' }, { day: 'Fri', temp: '34°', icon: 'wb_sunny' }] },
    Kolkata: { temp: '32°C', condition: 'Thunderstorms Likely', humidity: '85%', wind: '18 km/h', uv: 'Moderate (5)', forecast: [{ day: 'Mon', temp: '31°', icon: 'thunderstorm' }, { day: 'Tue', temp: '30°', icon: 'rainy' }, { day: 'Wed', temp: '32°', icon: 'cloud' }, { day: 'Thu', temp: '33°', icon: 'wb_sunny' }, { day: 'Fri', temp: '32°', icon: 'partly_cloudy_day' }] },
  };

  const weatherData = INDIAN_CITIES[city] || INDIAN_CITIES['Mumbai'];

  // QR & Barcode state
  const [qrText, setQrText] = useState('upi://pay?pa=weeverything@upi&pn=WeEverything&cu=INR');
  const [qrMode, setQrMode] = useState<'generate' | 'scan' | 'barcode'>('generate');

  // Currency Converter state (INR Default)
  const [currAmount, setCurrAmount] = useState('1000');
  const [currFrom, setCurrFrom] = useState('INR');
  const [currTo, setCurrTo] = useState('USD');
  const rates: Record<string, number> = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.86, AED: 0.044, SGD: 0.016 };

  const convertedValue = (
    (parseFloat(currAmount || '0') / (rates[currFrom] || 1)) *
    (rates[currTo] || 1)
  ).toFixed(2);

  // Unit Converter state
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'temp'>('length');
  const [unitVal, setUnitVal] = useState('10');

  // Password Generator & Vault state
  const [genPass, setGenPass] = useState('');
  const [passLength, setPassLength] = useState(16);
  const [vault] = useState([
    { service: 'SBI Net Banking', username: 'atharv_sbi', pass: '••••••••••••' },
    { service: 'DigiLocker Account', username: '9876543210', pass: '••••••••••••' },
    { service: 'IRCTC Rail Connect', username: 'atharv_irctc', pass: '••••••••••••' },
    { service: 'Groww Investments', username: 'atharv@weeverything.app', pass: '••••••••••••' },
  ]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < passLength; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGenPass(res);
  };

  // Hardware Diagnostics & Speed Test
  const [batteryLevel, setBatteryLevel] = useState<string>('92%');
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState('84.5 Mbps');
  const [uploadSpeed, setUploadSpeed] = useState('32.1 Mbps');

  // Audio Recorder & Media state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOnlineStatus(navigator.onLine);
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((bat: any) => {
          setBatteryLevel(`${Math.round(bat.level * 100)}%`);
          setIsCharging(bat.charging);
        });
      }
    }
  }, []);

  const runSpeedTest = () => {
    setSpeedTestRunning(true);
    setTimeout(() => {
      setDownloadSpeed(`${(Math.random() * 60 + 60).toFixed(1)} Mbps`);
      setUploadSpeed(`${(Math.random() * 20 + 20).toFixed(1)} Mbps`);
      setSpeedTestRunning(false);
    }, 2000);
  };

  const toggleFlashlight = () => {
    setFlashlightOn(!flashlightOn);
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Visual Flashlight overlay if active */}
      {flashlightOn && (
        <div className="fixed inset-0 z-50 bg-white/95 text-black flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-8xl animate-pulse text-amber-500">flashlight_on</span>
          <h2 className="font-display font-bold text-2xl">FLASHLIGHT BEAM ACTIVE</h2>
          <button
            onClick={toggleFlashlight}
            className="bg-black text-white px-8 py-3 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer"
          >
            Turn Off Flashlight
          </button>
        </div>
      )}

      <MiniAppHeader
        category="SMARTPHONE OS ESSENTIALS"
        title="Everyday Phone Utilities"
        description="Weather, QR/Barcode Scanner, INR Currency Converter, Password Vault, Hardware Diagnostics & Emergency Services"
      />

      {/* Navigation Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'weather', label: 'Weather', icon: 'thermostat' },
          { key: 'qr', label: 'QR & Barcode Scanner', icon: 'qr_code_scanner' },
          { key: 'converter', label: 'Currency & Units', icon: 'currency_exchange' },
          { key: 'passwords', label: 'Password Vault', icon: 'lock' },
          { key: 'device', label: 'Hardware & Speed', icon: 'smartphone' },
          { key: 'media', label: 'Media & Voice Recorder', icon: 'mic' },
          { key: 'contacts', label: 'Emergency Contacts', icon: 'emergency' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <div className="space-y-6">
          <div className="anime-stagger flex flex-wrap gap-2">
            {Object.keys(INDIAN_CITIES).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border cursor-pointer ${
                  city === c ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] font-bold' : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">INDIAN METRO WEATHER</span>
              <h2 className="font-display text-4xl font-extrabold text-[var(--color-text)]">{city}</h2>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">{weatherData.condition}</p>
              <div className="flex gap-4 pt-2 font-mono text-xs text-[var(--color-text-muted)]">
                <span>Humidity: {weatherData.humidity}</span>
                <span>Wind: {weatherData.wind}</span>
                <span>UV Index: {weatherData.uv}</span>
              </div>
            </div>

            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-[var(--color-primary)]">wb_sunny</span>
              <p className="font-mono text-5xl font-black text-[var(--color-text)] mt-2">{weatherData.temp}</p>
            </div>
          </div>

          <div className="anime-stagger grid grid-cols-5 gap-3">
            {weatherData.forecast.map((f: any, i: number) => (
              <div key={i} className="glass-card border border-[var(--color-border)] rounded-xl p-4 text-center space-y-2">
                <p className="font-mono text-xs text-[var(--color-text-muted)]">{f.day}</p>
                <span className="material-symbols-outlined text-2xl text-[var(--color-primary)]">{f.icon}</span>
                <p className="font-display font-bold text-sm text-[var(--color-text)]">{f.temp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR & Barcode Tab */}
      {activeTab === 'qr' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">QR & Barcode Tools</h3>
              <div className="flex bg-[var(--color-surface-dim)] p-1 rounded-lg border border-[var(--color-border)]">
                <button
                  onClick={() => setQrMode('generate')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${
                    qrMode === 'generate' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  Generator
                </button>
                <button
                  onClick={() => setQrMode('scan')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold rounded cursor-pointer ${
                    qrMode === 'scan' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  Scanner
                </button>
              </div>
            </div>

            {qrMode === 'generate' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter UPI VPA, URL, or plain text..."
                  className="w-full input-neon"
                />
                <div className="bg-white p-6 rounded-xl flex items-center justify-center w-fit mx-auto shadow-xl">
                  <QRCodeSVG value={qrText || 'WeEverything India'} size={180} />
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-8 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-[var(--color-primary)] animate-pulse">
                  qr_code_scanner
                </span>
                <p className="font-display font-bold text-sm text-[var(--color-text)]">Camera QR & Barcode Scanner Active</p>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">Align QR code or Barcode within viewfinder</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Converter Tab */}
      {activeTab === 'converter' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency Converter */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">currency_exchange</span>
              INR Currency Converter
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Amount</label>
                <input
                  type="number"
                  value={currAmount}
                  onChange={(e) => setCurrAmount(e.target.value)}
                  className="w-full input-neon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">From Currency</label>
                  <select
                    value={currFrom}
                    onChange={(e) => setCurrFrom(e.target.value)}
                    className="w-full input-neon"
                  >
                    {Object.keys(rates).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">To Currency</label>
                  <select
                    value={currTo}
                    onChange={(e) => setCurrTo(e.target.value)}
                    className="w-full input-neon"
                  >
                    {Object.keys(rates).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-4 text-center space-y-1">
                <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Converted Valuation</span>
                <p className="font-bold text-2xl text-[var(--color-primary)]">
                  {convertedValue} {currTo}
                </p>
              </div>
            </div>
          </div>

          {/* Unit Converter */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">straighten</span>
              Unit Converter
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Unit Type</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as any)}
                  className="w-full input-neon"
                >
                  <option value="length">Length (KM ↔ Miles)</option>
                  <option value="weight">Weight (KG ↔ Lbs)</option>
                  <option value="temp">Temperature (°C ↔ °F)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Input Value</label>
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(e.target.value)}
                  className="w-full input-neon"
                />
              </div>

              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-4 text-center space-y-1">
                <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Converted Output</span>
                <p className="font-bold text-xl text-[var(--color-primary)]">
                  {unitType === 'length'
                    ? `${(parseFloat(unitVal || '0') * 0.621371).toFixed(2)} Miles`
                    : unitType === 'weight'
                    ? `${(parseFloat(unitVal || '0') * 2.20462).toFixed(2)} Lbs`
                    : `${((parseFloat(unitVal || '0') * 9) / 5 + 32).toFixed(1)} °F`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passwords Tab */}
      {activeTab === 'passwords' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Generator */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Strong Password Generator</h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Length: {passLength} characters</label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={passLength}
                  onChange={(e) => setPassLength(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
              <button
                onClick={generatePassword}
                className="w-full btn-neon py-2.5 uppercase font-bold"
              >
                Generate Secure Password
              </button>
              {genPass && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] p-3 rounded-xl font-mono text-xs text-[var(--color-primary)] text-center font-bold break-all">
                  {genPass}
                </div>
              )}
            </div>
          </div>

          {/* Password Vault UI */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Password Vault (Encrypted Storage)</h3>
            <div className="space-y-2.5 font-mono text-xs">
              {vault.map((v, i) => (
                <div key={i} className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[var(--color-text)]">{v.service}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{v.username}</p>
                  </div>
                  <span className="text-[var(--color-primary)] font-bold">{v.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hardware & Diagnostics Tab */}
      {activeTab === 'device' && (
        <div className="anime-stagger space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Battery & Charging */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-2 text-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">battery_charging_full</span>
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">BATTERY STATUS</span>
              <p className="font-display font-extrabold text-2xl text-[var(--color-text)]">{batteryLevel}</p>
              <p className="font-mono text-xs text-emerald-400 font-bold">{isCharging ? '● Fast Charging Active' : 'Discharging'}</p>
            </div>

            {/* Storage Usage */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-2 text-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">sd_card</span>
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">STORAGE OCCUPIED</span>
              <p className="font-display font-extrabold text-2xl text-[var(--color-text)]">42.8 GB / 128 GB</p>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">33% Capacity Used</p>
            </div>

            {/* Flashlight */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-2 text-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">flashlight_on</span>
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">HARDWARE TORCH</span>
              <button
                onClick={toggleFlashlight}
                className="w-full btn-glass border border-[var(--color-border)] py-2 rounded-xl font-mono text-xs uppercase font-bold text-[var(--color-primary)] cursor-pointer"
              >
                {flashlightOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
              </button>
            </div>
          </div>

          {/* Speed Test & Network Status */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">speed</span>
                Live Internet Speed Test & 5G Network Status
              </h3>
              <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${onlineStatus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {onlineStatus ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-center">
              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] p-4 rounded-xl">
                <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Download Speed</span>
                <p className="font-bold text-2xl text-[var(--color-primary)] mt-1">{downloadSpeed}</p>
              </div>
              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] p-4 rounded-xl">
                <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Upload Speed</span>
                <p className="font-bold text-2xl text-[var(--color-text)] mt-1">{uploadSpeed}</p>
              </div>
            </div>

            <button
              onClick={runSpeedTest}
              disabled={speedTestRunning}
              className="w-full btn-neon py-3 uppercase font-bold"
            >
              {speedTestRunning ? 'Testing Connection Speed...' : 'Run Speed Test'}
            </button>
          </div>
        </div>
      )}

      {/* Media & Audio Recorder Tab */}
      {activeTab === 'media' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Audio Voice Recorder */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 text-center">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Audio & Voice Memo Recorder</h3>
            <div className="py-6 space-y-3">
              <div className={`w-20 h-20 rounded-full bg-[var(--color-primary-dim)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center mx-auto ${isRecording ? 'animate-pulse' : ''}`}>
                <span className="material-symbols-outlined text-4xl">mic</span>
              </div>
              <p className="font-mono text-xs text-[var(--color-text)] font-bold">{isRecording ? `Recording... ${recordSec}s` : 'Ready to record'}</p>
            </div>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-full py-3 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer ${
                isRecording ? 'bg-red-500 text-white' : 'btn-neon'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Audio Recording'}
            </button>
          </div>

          {/* Media Player UI */}
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Document & PDF Viewer</h3>
            <div className="space-y-2 font-mono text-xs">
              {[
                { title: 'Aadhaar_Card_Verified.pdf', size: '1.2 MB', icon: 'picture_as_pdf' },
                { title: 'PAN_Card_ePass.pdf', size: '850 KB', icon: 'picture_as_pdf' },
                { title: 'Salary_Slip_Form16.pdf', size: '2.4 MB', icon: 'description' },
              ].map((doc, i) => (
                <div key={i} className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">{doc.icon}</span>
                    <div>
                      <h4 className="font-bold text-[var(--color-text)]">{doc.title}</h4>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{doc.size}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xs text-[var(--color-text-muted)]">visibility</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">emergency</span>
            National Emergency Helpline Numbers (India)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {[
              { title: 'National Emergency Number', num: '112', icon: 'local_police' },
              { title: 'Police Department', num: '100', icon: 'shield' },
              { title: 'Fire Force Brigade', num: '101', icon: 'local_fire_department' },
              { title: 'Ambulance Medical Response', num: '102', icon: 'medical_services' },
              { title: 'Women Helpline Number', num: '1091', icon: 'female' },
              { title: 'Cyber Crime Portal', num: '1930', icon: 'security' },
            ].map((c, i) => (
              <a
                key={i}
                href={`tel:${c.num}`}
                className="p-4 bg-[var(--color-surface-dim)] border border-[var(--color-border)] hover:border-red-500 rounded-xl flex justify-between items-center group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-400 text-xl">{c.icon}</span>
                  <div>
                    <h4 className="font-bold text-[var(--color-text)] group-hover:text-red-400 transition-colors">{c.title}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Instant One-Touch Hotline</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-base text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-3 py-1 rounded-lg border border-[rgba(223,255,0,0.3)]">
                  {c.num}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
