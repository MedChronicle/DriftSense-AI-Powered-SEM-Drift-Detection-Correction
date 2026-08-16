import React, { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import {
  Upload, Play, ZoomIn, ZoomOut, RotateCcw, ChevronRight,
  Eye, EyeOff, Activity, Layers, Clock, AlertCircle, Move,
  RefreshCw, Settings2, BarChart2, Sparkles, ChevronDown,
  Cpu, BookOpen, Globe,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import bgVideo from "@/imports/orbital-ring-station-live-wallpaper.mp4";

const GLOBAL_CSS = `
@keyframes flip3d {
  0%   { transform:perspective(1100px) rotateY(0deg) scale(1); }
  30%  { transform:perspective(1100px) rotateY(120deg) scale(0.88); }
  60%  { transform:perspective(1100px) rotateY(240deg) scale(0.88); }
  100% { transform:perspective(1100px) rotateY(360deg) scale(1); }
}
@keyframes btn-glow {
  0%,100% { box-shadow:0 0 18px rgba(0,212,255,0.18),0 0 0 1px rgba(0,212,255,0.3); }
  50%      { box-shadow:0 0 44px rgba(0,212,255,0.52),0 0 0 1px rgba(0,212,255,0.65); }
}
@keyframes badge-flash-green {
  0%   { background:rgba(16,185,129,0.08); box-shadow:none; }
  30%  { background:rgba(16,185,129,0.4); box-shadow:0 0 26px rgba(16,185,129,0.7); }
  100% { background:rgba(16,185,129,0.08); box-shadow:none; }
}
@keyframes badge-shake-red {
  0%,100% { transform:translateX(0); }
  20%     { transform:translateX(-5px); }
  40%     { transform:translateX(5px); }
  60%     { transform:translateX(-3px); }
  80%     { transform:translateX(3px); }
}
@keyframes fade-up {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes spin-cw { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes results-in {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes breathe { 0%,100% { opacity:0.45; } 50% { opacity:1; } }
@keyframes breathe-scale {
  0%,100% { transform:scale(1); opacity:0.5; }
  50%     { transform:scale(1.06); opacity:1; }
}
@keyframes suggestion-slide {
  from { opacity:0; transform:translateY(-8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bounce-arr {
  0%,100% { transform:translateX(-50%) translateY(0); }
  50%     { transform:translateX(-50%) translateY(7px); }
}
@keyframes ticker { 0% { transform:translateY(0); } 100% { transform:translateY(-50%); } }
@keyframes guide-in {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes score-reveal {
  0%  { opacity:0; transform:perspective(900px) scale(0.55) rotateX(28deg); }
  65% { transform:perspective(900px) scale(1.04) rotateX(-2deg); }
  100%{ opacity:1; transform:perspective(900px) scale(1) rotateX(0deg); }
}
@keyframes score-num {
  from { opacity:0; transform:translateY(30px) scale(0.7); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes ring-expand {
  from { transform:scale(0.4); opacity:0; }
  to   { transform:scale(1); opacity:1; }
}
@keyframes glass-shimmer {
  0%   { background-position:-200% center; }
  100% { background-position:200% center; }
}
@keyframes float-y {
  0%,100% { transform:translateY(0px); }
  50%     { transform:translateY(-5px); }
}
@keyframes lang-drop {
  from { opacity:0; transform:translateY(-6px) scale(0.95); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes orbit-spin-cw { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes orbit-spin-ccw { from { transform:rotate(360deg); } to { transform:rotate(0deg); } }
@keyframes orbit-pulse {
  0%,100% { opacity:0.35; stroke-width:1; }
  50%      { opacity:0.85; stroke-width:1.6; }
}
@keyframes orbit-dot-fly {
  from { offset-distance:0%; }
  to   { offset-distance:100%; }
}
@keyframes station-glow {
  0%,100% { opacity:0.5; }
  50%      { opacity:1; }
}
.badge-success { animation:badge-flash-green 900ms ease-out forwards; }
.badge-fail    { animation:badge-shake-red 500ms ease-out; }
.btn-idle      { animation:btn-glow 2.4s ease-in-out infinite; }
.metric-card   { animation:fade-up 500ms ease-out both; }
.results-in    { animation:results-in 700ms cubic-bezier(0.22,1,0.36,1) both; }
.suggestion    { animation:suggestion-slide 400ms ease-out both; }
.guide-in      { animation:guide-in 600ms cubic-bezier(0.22,1,0.36,1) both; }
.orbit-ring-a  { animation:orbit-spin-cw 70s linear infinite; }
.orbit-ring-b  { animation:orbit-spin-ccw 105s linear infinite; }
.orbit-ring-c  { animation:orbit-spin-cw 150s linear infinite; }
.orbit-pulse   { animation:orbit-pulse 3.4s ease-in-out infinite; }
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(0,200,255,0.12); border-radius:2px; }
`;

function OrbitalRingField(){
  const rings=[
    {r:620,ry:220,cls:"orbit-ring-a",op:0.16,w:1.2},
    {r:460,ry:460,cls:"orbit-ring-b",op:0.10,w:1},
    {r:340,ry:130,cls:"orbit-ring-c",op:0.20,w:1.4},
  ];
  return(
    <svg viewBox="0 0 1400 1400" style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible"}}>
      <defs>
        <radialGradient id="orbitCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,212,255,0.55)" />
          <stop offset="55%" stopColor="rgba(0,212,255,0.12)" />
          <stop offset="100%" stopColor="rgba(0,212,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="700" cy="700" r="140" fill="url(#orbitCoreGlow)" style={{animation:"station-glow 5s ease-in-out infinite"}} />
      {rings.map((rg,i)=>(
        <g key={i} className={rg.cls} style={{transformOrigin:"700px 700px"}}>
          <ellipse cx="700" cy="700" rx={rg.r} ry={rg.ry} fill="none" stroke={`rgba(0,212,255,${rg.op})`} strokeWidth={rg.w} className="orbit-pulse" />
          <circle cx={700+rg.r} cy="700" r="4" fill="#00d4ff" style={{filter:"drop-shadow(0 0 6px #00d4ff)"}} />
        </g>
      ))}
    </svg>
  );
}

function VideoBackground(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:-2,overflow:"hidden",background:BG}}>
      <video
        src={bgVideo}
        autoPlay muted loop playsInline
        style={{
          position:"absolute",inset:0,width:"100%",height:"100%",
          objectFit:"cover",transform:"scale(1.04)",
          filter:"brightness(0.62) saturate(1.3) contrast(1.12)",
          pointerEvents:"none",
        }}
      />
      <div style={{position:"absolute",inset:0,pointerEvents:"none",mixBlendMode:"screen",opacity:0.55,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:"min(120vw,1400px)",height:"min(120vw,1400px)",position:"relative"}}>
          <OrbitalRingField />
        </div>
      </div>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 38%,transparent 0%,rgba(0,4,14,0.18) 55%,rgba(0,2,10,0.4) 100%)"}} />
    </div>
  );
}

type Lang = "en" | "hi" | "ta" | "fr";

interface Tx {
  appName:string; tagline:string; subtitle:string; uploadText:string; dragHint:string;
  systemReady:string; analyzing:string; ready:string; runAnalysis:string; newSession:string;
  inputImage:string; aiSuggests:string; applyBtn:string; matchingMethod:string; algoParams:string;
  patchSize:string; searchRadius:string; corrThreshold:string; displayOpts:string;
  heatmapLbl:string; correctedLbl:string; preCorrLbl:string; analysisResults:string;
  confidenceScore:string; driftXLbl:string; driftYLbl:string; magnitudeLbl:string;
  correctionVec:string; matchFound:string; noMatch:string; sessionHistory:string;
  algoGuide:string; perf:string; bench:string; scrollResults:string; scrollGuide:string;
  reRun:string; skip:string; aiPowered:string; algorithms:string; precision:string;
  realtimeLbl:string; backViewer:string; runAgain:string; resultReveal:string;
  videoPlaying:string; imgComplexity:string; featureDensity:string; noiseLevel:string;
  textureRich:string; keypointRich:string; estimatedNoise:string;
  highConf:string; medConf:string; lowConf:string; noReliableMatch:string;
  lowerThresholdHint:string; detectedRegion:string;
  heatmapOn:string; heatmapOff:string; correctedBtn:string; preCorrBtn:string;
  loadingSensor:string; stages:string[]; runLbl:(n:number)=>string; selectLang:string;
  algorithms3:string; precision01:string; processing:string;
}

const TRANS: Record<Lang,Tx> = {
  en:{
    appName:"DRIFT-SENSE", tagline:"Navigation Error Recovery System",
    subtitle:"Finding a Needle in a Nanoscale Haystack",
    uploadText:"Upload your SEM wafer image", dragHint:"Drag & drop or click · JPEG · PNG · TIFF",
    systemReady:"SYSTEM READY", analyzing:"ANALYZING", ready:"READY",
    runAnalysis:"RUN ANALYSIS", newSession:"NEW SESSION", inputImage:"INPUT IMAGE",
    aiSuggests:"AI SUGGESTS", applyBtn:"APPLY SUGGESTIONS",
    matchingMethod:"MATCHING METHOD", algoParams:"ALGORITHM PARAMETERS",
    patchSize:"Patch Size", searchRadius:"Search Radius", corrThreshold:"Corr. Threshold",
    displayOpts:"DISPLAY OPTIONS", heatmapLbl:"Confidence Heatmap",
    correctedLbl:"View: Corrected", preCorrLbl:"View: Pre-Correction",
    analysisResults:"ANALYSIS RESULTS", confidenceScore:"CONFIDENCE SCORE",
    driftXLbl:"DRIFT X", driftYLbl:"DRIFT Y", magnitudeLbl:"MAGNITUDE",
    correctionVec:"CORRECTION VECTOR", matchFound:"✓ MATCH FOUND", noMatch:"✗ NO MATCH",
    sessionHistory:"SESSION HISTORY", algoGuide:"ALGORITHM INTELLIGENCE GUIDE",
    perf:"PERFORMANCE", bench:"BENCHMARKS",
    scrollResults:"SCROLL FOR RESULTS", scrollGuide:"SCROLL FOR MODEL GUIDE",
    reRun:"RE-RUN", skip:"SKIP", aiPowered:"AI-POWERED SEMICONDUCTOR INSPECTION",
    algorithms:"Algorithms", precision:"Precision", realtimeLbl:"Real-time",
    backViewer:"↑ BACK TO VIEWER", runAgain:"RUN ANALYSIS AGAIN",
    resultReveal:"ANALYSIS COMPLETE", videoPlaying:"RENDERING RESULT VISUALIZATION",
    imgComplexity:"IMG COMPLEXITY", featureDensity:"FEATURE DENSITY", noiseLevel:"NOISE LEVEL",
    textureRich:"texture richness", keypointRich:"keypoint richness", estimatedNoise:"estimated noise",
    highConf:"HIGH", medConf:"MEDIUM", lowConf:"LOW",
    noReliableMatch:"No reliable match found",
    lowerThresholdHint:"Lower threshold, increase patch size, or switch to Hybrid AI.",
    detectedRegion:"DETECTED REGION",
    heatmapOn:"HEATMAP ON", heatmapOff:"HEATMAP OFF",
    correctedBtn:"CORRECTED", preCorrBtn:"PRE-CORR",
    loadingSensor:"LOADING SENSOR DATA",
    stages:["Preprocessing image","Extracting features","Searching reference pattern","Computing drift vector"],
    runLbl:(n)=>`${n} run${n===1?"":"s"}`, selectLang:"LANGUAGE",
    algorithms3:"3", precision01:"±0.1nm", processing:"Processing",
  },
  hi:{
    appName:"ड्रिफ्ट-सेंस", tagline:"नेविगेशन त्रुटि पुनर्प्राप्ति प्रणाली",
    subtitle:"नैनोस्केल ढेर में सुई ढूँढना",
    uploadText:"अपनी SEM वेफर छवि अपलोड करें", dragHint:"खींचें और छोड़ें या क्लिक करें · JPEG · PNG · TIFF",
    systemReady:"सिस्टम तैयार", analyzing:"विश्लेषण हो रहा है", ready:"तैयार",
    runAnalysis:"विश्लेषण चलाएं", newSession:"नया सत्र", inputImage:"इनपुट छवि",
    aiSuggests:"AI सुझाव", applyBtn:"सुझाव लागू करें",
    matchingMethod:"मिलान विधि", algoParams:"एल्गोरिदम पैरामीटर",
    patchSize:"पैच आकार", searchRadius:"खोज त्रिज्या", corrThreshold:"सहसंबंध सीमा",
    displayOpts:"प्रदर्शन विकल्प", heatmapLbl:"विश्वास हीटमैप",
    correctedLbl:"दृश्य: सुधरा हुआ", preCorrLbl:"दृश्य: पूर्व-सुधार",
    analysisResults:"विश्लेषण परिणाम", confidenceScore:"विश्वास स्कोर",
    driftXLbl:"ड्रिफ्ट X", driftYLbl:"ड्रिफ्ट Y", magnitudeLbl:"परिमाण",
    correctionVec:"सुधार वेक्टर", matchFound:"✓ मिलान मिला", noMatch:"✗ कोई मिलान नहीं",
    sessionHistory:"सत्र इतिहास", algoGuide:"एल्गोरिदम बुद्धिमत्ता गाइड",
    perf:"प्रदर्शन", bench:"बेंचमार्क",
    scrollResults:"परिणाम के लिए स्क्रॉल करें", scrollGuide:"मॉडल गाइड के लिए स्क्रॉल करें",
    reRun:"पुनः चलाएं", skip:"छोड़ें", aiPowered:"AI-संचालित सेमीकंडक्टर निरीक्षण",
    algorithms:"एल्गोरिदम", precision:"सटीकता", realtimeLbl:"वास्तविक-समय",
    backViewer:"↑ व्यूअर पर वापस", runAgain:"पुनः विश्लेषण करें",
    resultReveal:"विश्लेषण पूर्ण", videoPlaying:"परिणाम दृश्यीकरण प्रस्तुत हो रहा है",
    imgComplexity:"छवि जटिलता", featureDensity:"फीचर घनत्व", noiseLevel:"शोर स्तर",
    textureRich:"बनावट समृद्धि", keypointRich:"कीपॉइंट समृद्धि", estimatedNoise:"अनुमानित शोर",
    highConf:"उच्च", medConf:"मध्यम", lowConf:"निम्न",
    noReliableMatch:"कोई विश्वसनीय मिलान नहीं मिला",
    lowerThresholdHint:"सीमा कम करें, पैच आकार बढ़ाएं, या Hybrid AI पर स्विच करें।",
    detectedRegion:"पहचाना गया क्षेत्र",
    heatmapOn:"हीटमैप चालू", heatmapOff:"हीटमैप बंद",
    correctedBtn:"सुधरा हुआ", preCorrBtn:"पूर्व-सुधार",
    loadingSensor:"सेंसर डेटा लोड हो रहा है",
    stages:["छवि पूर्व-प्रसंस्करण","विशेषताएं निकालना","संदर्भ पैटर्न खोजना","ड्रिफ्ट वेक्टर गणना"],
    runLbl:(n)=>`${n} रन`, selectLang:"भाषा",
    algorithms3:"3", precision01:"±0.1nm", processing:"प्रसंस्करण",
  },
  ta:{
    appName:"டிரிஃப்ட்-சென்ஸ்", tagline:"நேவிகேஷன் பிழை மீட்பு அமைப்பு",
    subtitle:"நானோ அளவில் ஊசியை கண்டுபிடிக்கும் தொழில்நுட்பம்",
    uploadText:"உங்கள் SEM வேஃபர் படத்தை பதிவேற்றவும்", dragHint:"இழுத்து விடுங்கள் அல்லது கிளிக் செய்யுங்கள் · JPEG · PNG · TIFF",
    systemReady:"கணினி தயார்", analyzing:"பகுப்பாய்வு நடக்கிறது", ready:"தயார்",
    runAnalysis:"பகுப்பாய்வு இயக்கு", newSession:"புதிய அமர்வு", inputImage:"உள்ளீட்டு படம்",
    aiSuggests:"AI பரிந்துரை", applyBtn:"பரிந்துரைகளை பயன்படுத்து",
    matchingMethod:"பொருத்தும் முறை", algoParams:"வழிமுறை அளவுருக்கள்",
    patchSize:"பேட்ச் அளவு", searchRadius:"தேடல் ஆரம்", corrThreshold:"தொடர்பு வரம்பு",
    displayOpts:"காட்சி விருப்பங்கள்", heatmapLbl:"நம்பிக்கை வெப்ப வரைபடம்",
    correctedLbl:"காட்சி: திருத்தப்பட்டது", preCorrLbl:"காட்சி: முன்-திருத்தம்",
    analysisResults:"பகுப்பாய்வு முடிவுகள்", confidenceScore:"நம்பிக்கை மதிப்பெண்",
    driftXLbl:"விலகல் X", driftYLbl:"விலகல் Y", magnitudeLbl:"அளவு",
    correctionVec:"திருத்தல் திசையன்", matchFound:"✓ பொருத்தம் கண்டுபிடிக்கப்பட்டது", noMatch:"✗ பொருத்தம் இல்லை",
    sessionHistory:"அமர்வு வரலாறு", algoGuide:"வழிமுறை நுண்ணறிவு வழிகாட்டி",
    perf:"செயல்திறன்", bench:"அளவுகோல்கள்",
    scrollResults:"முடிவுகளுக்கு உருட்டவும்", scrollGuide:"மாதிரி வழிகாட்டிக்கு உருட்டவும்",
    reRun:"மீண்டும் இயக்கு", skip:"தவிர்", aiPowered:"AI-இயங்கும் குறைகடத்தி ஆய்வு",
    algorithms:"வழிமுறைகள்", precision:"துல்லியம்", realtimeLbl:"நிகழ்-நேரம்",
    backViewer:"↑ பார்வையாளருக்கு திரும்பு", runAgain:"மீண்டும் பகுப்பாய்வு செய்",
    resultReveal:"பகுப்பாய்வு முடிந்தது", videoPlaying:"முடிவு காட்சிப்படுத்தல் வழங்கப்படுகிறது",
    imgComplexity:"படம் சிக்கலானது", featureDensity:"அம்சம் அடர்த்தி", noiseLevel:"சத்தம் நிலை",
    textureRich:"அமைப்பு வளம்", keypointRich:"முக்கிய புள்ளி வளம்", estimatedNoise:"மதிப்பிடப்பட்ட சத்தம்",
    highConf:"உயர்", medConf:"நடுத்தர", lowConf:"குறைந்த",
    noReliableMatch:"நம்பகமான பொருத்தம் கிடைக்கவில்லை",
    lowerThresholdHint:"வரம்பை குறைக்கவும், பேட்ச் அளவை அதிகரிக்கவும் அல்லது Hybrid AI-ஐ பயன்படுத்தவும்.",
    detectedRegion:"கண்டறியப்பட்ட பகுதி",
    heatmapOn:"வெப்ப வரைபடம் இயக்கு", heatmapOff:"வெப்ப வரைபடம் நிறுத்து",
    correctedBtn:"திருத்தப்பட்டது", preCorrBtn:"முன்-திருத்தம்",
    loadingSensor:"சென்சார் தரவு ஏற்றுகிறது",
    stages:["படம் முன்செயலாக்கம்","அம்சங்கள் பிரித்தெடுத்தல்","குறிப்பு வடிவம் தேடுதல்","விலகல் திசையன் கணக்கிடுதல்"],
    runLbl:(n)=>`${n} இயக்கம்`, selectLang:"மொழி",
    algorithms3:"3", precision01:"±0.1nm", processing:"செயலாக்கம்",
  },
  fr:{
    appName:"DRIFT-SENSE", tagline:"Système de récupération d'erreur de navigation",
    subtitle:"Trouver une aiguille dans une meule de foin nanométrique",
    uploadText:"Téléchargez votre image wafer SEM", dragHint:"Glisser-déposer ou cliquer · JPEG · PNG · TIFF",
    systemReady:"SYSTÈME PRÊT", analyzing:"ANALYSE EN COURS", ready:"PRÊT",
    runAnalysis:"LANCER L'ANALYSE", newSession:"NOUVELLE SESSION", inputImage:"IMAGE D'ENTRÉE",
    aiSuggests:"SUGGESTION IA", applyBtn:"APPLIQUER LES SUGGESTIONS",
    matchingMethod:"MÉTHODE DE CORRESPONDANCE", algoParams:"PARAMÈTRES D'ALGORITHME",
    patchSize:"Taille de patch", searchRadius:"Rayon de recherche", corrThreshold:"Seuil de corrélation",
    displayOpts:"OPTIONS D'AFFICHAGE", heatmapLbl:"Carte de chaleur",
    correctedLbl:"Vue: Corrigée", preCorrLbl:"Vue: Pré-correction",
    analysisResults:"RÉSULTATS D'ANALYSE", confidenceScore:"SCORE DE CONFIANCE",
    driftXLbl:"DÉRIVE X", driftYLbl:"DÉRIVE Y", magnitudeLbl:"MAGNITUDE",
    correctionVec:"VECTEUR DE CORRECTION", matchFound:"✓ CORRESPONDANCE TROUVÉE", noMatch:"✗ AUCUNE CORRESPONDANCE",
    sessionHistory:"HISTORIQUE DE SESSION", algoGuide:"GUIDE D'INTELLIGENCE ALGORITHMIQUE",
    perf:"PERFORMANCE", bench:"RÉFÉRENCES",
    scrollResults:"DÉFILER POUR LES RÉSULTATS", scrollGuide:"DÉFILER POUR LE GUIDE",
    reRun:"RELANCER", skip:"PASSER", aiPowered:"INSPECTION SEMI-CONDUCTEUR IA",
    algorithms:"Algorithmes", precision:"Précision", realtimeLbl:"Temps-réel",
    backViewer:"↑ RETOUR AU VISUALISEUR", runAgain:"RELANCER L'ANALYSE",
    resultReveal:"ANALYSE TERMINÉE", videoPlaying:"RENDU DE LA VISUALISATION",
    imgComplexity:"COMPLEXITÉ IMAGE", featureDensity:"DENSITÉ DE FEATURES", noiseLevel:"NIVEAU DE BRUIT",
    textureRich:"richesse texture", keypointRich:"richesse keypoints", estimatedNoise:"bruit estimé",
    highConf:"ÉLEVÉ", medConf:"MOYEN", lowConf:"FAIBLE",
    noReliableMatch:"Aucune correspondance fiable trouvée",
    lowerThresholdHint:"Abaissez le seuil, augmentez le patch ou passez à Hybrid AI.",
    detectedRegion:"RÉGION DÉTECTÉE",
    heatmapOn:"CARTE ACTIVÉE", heatmapOff:"CARTE DÉSACTIVÉE",
    correctedBtn:"CORRIGÉ", preCorrBtn:"PRÉ-CORR",
    loadingSensor:"CHARGEMENT DES DONNÉES",
    stages:["Prétraitement image","Extraction de features","Recherche motif référence","Calcul vecteur dérive"],
    runLbl:(n)=>`${n} exécution${n>1?"s":""}`, selectLang:"LANGUE",
    algorithms3:"3", precision01:"±0.1nm", processing:"Traitement",
  },
};

type Screen      = "upload"|"configure"|"processing"|"results";
type ResultPhase = "score"|"full";
type Method      = "NCC"|"Feature-Based"|"Hybrid AI";
interface Params { patchSize:number; searchRadius:number; threshold:number; method:Method; }
interface BBox   { x:number; y:number; w:number; h:number; }
interface RunResult {
  id:number; confidence:number; driftX:number; driftY:number;
  correctionX:number; correctionY:number; processingTime:number;
  bbox:BBox; success:boolean; timestamp:Date; imgW:number; imgH:number; params:Params;
  imgComplexity:number; featureDensity:number; noiseLevel:number;
}
interface Suggestion { patchSize:number; searchRadius:number; threshold:number; method:Method; reason:string; details:string[]; }

const RADAR_DATA = [
  { metric:"Speed",       NCC:95,  Feature:62,  Hybrid:38  },
  { metric:"Accuracy",    NCC:56,  Feature:74,  Hybrid:96  },
  { metric:"Rotation",    NCC:18,  Feature:73,  Hybrid:92  },
  { metric:"Noise Tol",   NCC:38,  Feature:66,  Hybrid:90  },
  { metric:"Scale Inv",   NCC:25,  Feature:74,  Hybrid:88  },
  { metric:"Low Texture", NCC:84,  Feature:52,  Hybrid:76  },
];
const SCENARIO_DATA = [
  { case:"Simple Pattern",  NCC:91, Feature:67, Hybrid:73 },
  { case:"Complex Scene",   NCC:31, Feature:72, Hybrid:97 },
  { case:"Real-Time",       NCC:96, Feature:63, Hybrid:36 },
  { case:"Noisy SEM",       NCC:37, Feature:64, Hybrid:94 },
  { case:"Hi-Res Wafer",    NCC:53, Feature:79, Hybrid:98 },
  { case:"Low-Res (<256px)",NCC:76, Feature:60, Hybrid:81 },
  { case:"Rotation ±15°",   NCC:22, Feature:76, Hybrid:90 },
];
const MODEL_CARDS = [
  {
    id:"NCC" as Method, color:"#3b82f6", title:"Normalized Cross-Correlation", badge:"FASTEST",
    desc:"Pixel-by-pixel correlation between template and search window. Normalized to handle global brightness shifts. Zero ML dependencies — pure signal processing.",
    pros:["Sub-millisecond inference","Deterministic output","No GPU required","Zero false positives on ideal conditions"],
    cons:["Fails under rotation / scaling","Highly sensitive to noise","Degrades on complex textures","Large search windows hurt speed"],
    best:["Repeating lattice structures","Controlled illumination","Real-time throughput > 200 fps","Edge hardware"],
    params:"Patch ≤ 48px · Radius ≤ 80nm · Threshold ≥ 0.75",
  },
  {
    id:"Feature-Based" as Method, color:"#8b5cf6", title:"Feature-Based Matching", badge:"BALANCED",
    desc:"Keypoint detection + descriptor matching (SIFT/ORB variant). Robust to moderate affine transforms. Matches descriptor vectors between reference and query image.",
    pros:["Handles ±20° rotation","Tolerant to partial occlusion","Works across resolution scales","Moderate speed with GPU"],
    cons:["Fails on featureless regions","2–4× slower than NCC","Requires ≥30 distinct keypoints","Memory scales with keypoint count"],
    best:["Medium-complexity SEM wafers","Known lighting variations","Moderate rotation expected","Sub-pixel drift detection"],
    params:"Patch 48–80px · Radius 60–140nm · Threshold 0.68–0.80",
  },
  {
    id:"Hybrid AI" as Method, color:"#00d4ff", title:"Hybrid AI (CNN + Verify)", badge:"MOST ACCURATE",
    desc:"A convolutional attention encoder extracts 512-dim latent embeddings, computes cosine similarity, then refines with dense correlation. Two-stage: semantic match → sub-pixel verify.",
    pros:["State-of-the-art accuracy","Handles rotation, scale, occlusion","Outputs calibrated confidence + uncertainty","Learns from scene statistics"],
    cons:["3–5× slower than NCC","Requires GPU for <4s inference","680MB model weights","Less explainable"],
    best:["Complex or defect-heavy wafers","Unknown drift direction","Mission-critical inspection","High-noise low-SNR conditions"],
    params:"Patch 64–96px · Radius ≥ 80nm · Threshold 0.60–0.75",
  },
];

const STAGE_ENDS = [0.2,0.5,0.84,1.0];
const STAGE_DUR  = [1300,1800,2100,950];
const MONO = "'JetBrains Mono', monospace";
const SANS = "Inter, sans-serif";
const CYAN = "#00d4ff";
const BG   = "#060a10";

const confColor  = (c:number) => c>=85?"#10b981":c>=60?"#f59e0b":"#ef4444";
const confRgb    = (c:number) => c>=85?"16,185,129":c>=60?"245,158,11":"239,68,68";
const hms        = (d:Date)   => d.toLocaleTimeString("en-US",{hour12:false});
const driftMag   = (r:RunResult) => Math.round(Math.sqrt(r.driftX**2+r.driftY**2)*10)/10;

const glass = (alpha=0.04, blur=20): React.CSSProperties => ({
  background:`linear-gradient(135deg, rgba(0,210,255,${alpha+0.03}) 0%, rgba(0,190,255,${alpha}) 55%, rgba(0,140,220,${alpha*0.65}) 100%)`,
  backdropFilter:`blur(${blur}px) saturate(165%)`,
  WebkitBackdropFilter:`blur(${blur}px) saturate(165%)`,
  border:"1px solid rgba(0,210,255,0.14)",
  boxShadow:"0 8px 34px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 22px rgba(0,200,255,0.03)",
});
const glassW = (alpha=0.06, blur=26): React.CSSProperties => ({
  background:`linear-gradient(135deg, rgba(255,255,255,${alpha+0.035}) 0%, rgba(255,255,255,${alpha}) 55%, rgba(255,255,255,${alpha*0.55}) 100%)`,
  backdropFilter:`blur(${blur}px) saturate(160%)`,
  WebkitBackdropFilter:`blur(${blur}px) saturate(160%)`,
  border:"1px solid rgba(255,255,255,0.12)",
  boxShadow:"0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.10)",
});

function mkRng(seed:number){
  let s=(seed^0xdeadbeef)>>>0|1;
  return ()=>{
    s=Math.imul(s^(s>>>16),0x45d9f3b)>>>0;
    s=Math.imul(s^(s>>>16),0x45d9f3b)>>>0;
    return((s^(s>>>16))>>>0)/0x100000000;
  };
}

function simulate(file:File,params:Params,imgW:number,imgH:number,id:number):RunResult{
  const nameSeed=file.name.split("").reduce((a,c,i)=>a+c.charCodeAt(0)*(i+7),1);
  const timeSeed=Math.floor(Date.now()/180)%99991;
  const rng=mkRng(nameSeed^(file.size*13)^(timeSeed*37));
  const mp=(imgW*imgH)/1_000_000;
  const sizeNorm=Math.min(1,(file.size%600_000)/600_000);
  const nameChar=(nameSeed%100)/100;
  const complexity=sizeNorm*0.55+nameChar*0.45;
  const featureDensity=Math.min(1,mp*0.35+nameChar*0.65);
  const noiseLevel=Math.abs(sizeNorm-nameChar)*0.8;
  const resQuality=Math.min(1,mp/5);
  let conf:number;
  if(params.method==="NCC"){
    conf=48+(1-complexity)*32+(1-noiseLevel)*14+resQuality*4;
    if(params.patchSize<=40) conf+=10;
    else if(params.patchSize>=96) conf-=13;
    if(params.searchRadius<=60) conf+=7;
    else if(params.searchRadius>120) conf-=(params.searchRadius-120)*0.15;
    conf+=rng()*9+(rng()-0.5)*5;
  }else if(params.method==="Feature-Based"){
    conf=58+featureDensity*24+resQuality*9+(1-noiseLevel)*7;
    if(params.patchSize>=48&&params.patchSize<=80) conf+=9;
    else if(params.patchSize<32||params.patchSize>112) conf-=8;
    if(params.searchRadius>=50&&params.searchRadius<=140) conf+=6;
    conf+=rng()*7+(rng()-0.5)*3;
  }else{
    conf=70+complexity*11+featureDensity*9+resQuality*7+(1-noiseLevel)*3;
    if(params.patchSize>=32&&params.patchSize<=96) conf+=6;
    if(params.searchRadius>=60) conf+=5;
    if(params.searchRadius>=100) conf+=2;
    conf+=rng()*6+(rng()-0.5)*2;
  }
  conf-=(params.threshold-0.5)*28;
  const confidence=Math.max(9,Math.min(99.6,conf));
  const driftScale=params.searchRadius*(0.22+sizeNorm*0.65+nameChar*0.15);
  const driftX=(rng()*2-1)*driftScale*(0.7+rng()*0.6);
  const driftY=(rng()*2-1)*driftScale*(0.7+rng()*0.6);
  const pWn=Math.min(0.28,(params.patchSize/Math.max(imgW,1))*1.3);
  const pHn=Math.min(0.28,(params.patchSize/Math.max(imgH,1))*1.3);
  const bbox:BBox={
    x:Math.max(0.07,Math.min(0.87-pWn,0.08+rng()*(0.80-pWn))),
    y:Math.max(0.07,Math.min(0.87-pHn,0.08+rng()*(0.80-pHn))),
    w:Math.max(0.07,pWn),h:Math.max(0.07,pHn),
  };
  const mBase:Record<Method,number>={"NCC":0.65,"Feature-Based":2.1,"Hybrid AI":3.75};
  const procTime=mBase[params.method]+(file.size/2_800_000)+rng()*0.8+0.05;
  return{
    id,confidence:Math.round(confidence*10)/10,
    driftX:Math.round(driftX*10)/10,driftY:Math.round(driftY*10)/10,
    correctionX:Math.round(-driftX*10)/10,correctionY:Math.round(-driftY*10)/10,
    processingTime:Math.round(procTime*100)/100,
    bbox,success:confidence>=params.threshold*100,
    timestamp:new Date(),imgW,imgH,params,
    imgComplexity:Math.round(complexity*100)/100,
    featureDensity:Math.round(featureDensity*100)/100,
    noiseLevel:Math.round(noiseLevel*100)/100,
  };
}

function computeSuggestion(file:File,dims:{w:number;h:number}):Suggestion{
  const mp=(dims.w*dims.h)/1_000_000;
  const sizeMB=file.size/1_000_000;
  const aspect=dims.w/dims.h;
  const bpmp=sizeMB/Math.max(mp,0.01);
  const nHash=file.name.split("").reduce((a,c,i)=>a+c.charCodeAt(0)*(i+3),0);
  const nudge=(nHash%17)-8;
  let patchSize=mp>10?128:mp>5?112:mp>2?96:mp>1?80:mp>0.5?64:mp>0.2?48:32;
  if(aspect>1.8) patchSize=Math.min(128,patchSize+16);
  if(aspect<0.6) patchSize=Math.max(16,patchSize-16);
  patchSize=Math.round(patchSize/8)*8;
  let searchRadius=bpmp>5?160:bpmp>2?130:bpmp>0.8?100:bpmp>0.3?75:45;
  if(mp>4) searchRadius=Math.min(200,searchRadius+20);
  searchRadius=Math.round((searchRadius+nudge)/5)*5;
  searchRadius=Math.max(20,Math.min(200,searchRadius));
  let threshold=0.60+Math.min(bpmp,3)*0.07+(mp>2?0.04:0);
  if(aspect>0.85&&aspect<1.18) threshold+=0.03;
  threshold+=nudge*0.004;
  threshold=Math.round(Math.max(0.52,Math.min(0.94,threshold))*100)/100;
  const method:Method=(mp>3||bpmp>2)?"Hybrid AI":(mp>0.5||bpmp>0.5)?"Feature-Based":"NCC";
  const resTag=mp>4?"hi-res":mp<0.4?"low-res":"medium-res";
  const denTag=bpmp>2?"rich texture":bpmp<0.3?"high compression":"moderate detail";
  const aspTag=aspect>1.5?"wide-format":aspect<0.7?"portrait":"standard aspect";
  return{
    patchSize,searchRadius,threshold,method,
    reason:`${dims.w}×${dims.h}px ${resTag} · ${denTag} · ${aspTag}`,
    details:[
      `${mp.toFixed(2)} MP → patch ${patchSize}px`,
      `${bpmp.toFixed(2)} B/MP density → radius ${searchRadius}nm`,
      `aspect ${aspect.toFixed(2)} → threshold ${threshold}`,
      `optimal algorithm: ${method}`,
    ],
  };
}

function useCountUp(target:number,duration=750,dec=1){
  const[val,setVal]=useState(0);
  const rafRef=useRef<number>(0);
  useEffect(()=>{
    const t0=Date.now(); cancelAnimationFrame(rafRef.current);
    const tick=()=>{
      const t=Math.min(1,(Date.now()-t0)/duration);
      const e=1-Math.pow(1-t,3);
      setVal(Math.round(target*e*10**dec)/10**dec);
      if(t<1) rafRef.current=requestAnimationFrame(tick); else setVal(target);
    };
    tick();
    return()=>cancelAnimationFrame(rafRef.current);
  },[target,duration,dec]);
  return val;
}

function GlassCard({children,style,onClick,glassAlpha=0.04,glassBlur=12}:{
  children:React.ReactNode; style?:React.CSSProperties;
  onClick?:()=>void; glassAlpha?:number; glassBlur?:number;
}){
  const ref=useRef<HTMLDivElement>(null);
  const[tilt,setTilt]=useState({x:0,y:0});
  const[hov,setHov]=useState(false);
  const onMM=(e:React.MouseEvent<HTMLDivElement>)=>{
    const el=ref.current; if(!el) return;
    const r=el.getBoundingClientRect();
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
    setTilt({x:dy*-7,y:dx*7});
  };
  return(
    <div ref={ref} onClick={onClick}
      onMouseMove={onMM} onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>{setHov(false);setTilt({x:0,y:0});}}
      style={{
        ...glass(glassAlpha,glassBlur),
        transform:hov?`perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.025) translateZ(4px)`:
          "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)",
        transition:hov?"transform 0.08s ease-out":"transform 0.35s ease-out",
        cursor:onClick?"pointer":"default",
        ...style,
      }}>
      {children}
    </div>
  );
}

const TELEM=["FRAME_BUFFER","CUDA_CORES: 4096","VRAM_ALLOC: 2.1GB","KERNEL_LAUNCH",
  "FEATURE_MAP[0]: 128ch","FEATURE_MAP[1]: 256ch","FEATURE_MAP[2]: 512ch",
  "ATTENTION_HEADS: 8×8","CONV_STRIDE: 1×1","PATCH_EMBED: 64px",
  "COSINE_SIM: RUNNING","ANCHOR_GRID: 14×14","DRIFT_SOLVER: ITER","GRAD_SCALE: 1e-3"];

function ProcessingOverlay({stages,stageIdx,progress,elapsed}:{stages:string[];stageIdx:number;progress:number;elapsed:number;}){
  const stage=stages[stageIdx]||"";
  return(
    <div style={{position:"absolute",inset:0,zIndex:10,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,rgba(0,100,200,0.18) 0%,transparent 65%),radial-gradient(ellipse at 70% 30%,rgba(0,200,255,0.12) 0%,transparent 60%),#030810"}} />
      <div style={{position:"absolute",inset:0,background:"rgba(2,6,16,0.58)"}} />
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.1) 3px,rgba(0,0,0,0.1) 4px)"}} />
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)",backgroundSize:"52px 52px"}} />
      <div style={{position:"absolute",top:16,left:16,width:230,height:180,overflow:"hidden",...glass(0.1,6),borderRadius:8}}>
        <div style={{padding:"5px 10px",borderBottom:"1px solid rgba(0,200,255,0.08)",display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:CYAN,boxShadow:`0 0 7px ${CYAN}`,animation:"breathe 0.9s infinite"}} />
          <span style={{color:"rgba(0,212,255,0.55)",fontFamily:MONO,fontSize:9,letterSpacing:"0.16em"}}>INFERENCE ENGINE</span>
        </div>
        <div style={{height:156,overflow:"hidden"}}>
          <div style={{animation:`ticker ${TELEM.length*0.62}s linear infinite`}}>
            {[...TELEM,...TELEM].map((l,i)=>(
              <div key={i} style={{padding:"2px 10px",display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"#1e3a50",fontFamily:MONO,fontSize:9}}>{l.split(":")[0]}</span>
                <span style={{color:"rgba(0,212,255,0.6)",fontFamily:MONO,fontSize:9}}>{l.includes(":")?l.split(":")[1].trim():"OK"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{position:"absolute",top:16,right:16,width:224,...glass(0.1,6),borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"5px 10px",borderBottom:"1px solid rgba(0,200,255,0.08)",display:"flex",alignItems:"center",gap:6}}>
          <Cpu size={10} style={{color:"rgba(0,212,255,0.55)"}} />
          <span style={{color:"rgba(0,212,255,0.55)",fontFamily:MONO,fontSize:9,letterSpacing:"0.16em"}}>PIPELINE STAGES</span>
        </div>
        {stages.map((s,i)=>{
          const done=i<stageIdx,active=i===stageIdx;
          return(
            <div key={i} style={{padding:"7px 10px",display:"flex",alignItems:"center",gap:8,borderBottom:i<3?"1px solid rgba(0,200,255,0.06)":"none",background:active?"rgba(0,212,255,0.04)":"transparent"}}>
              <div style={{width:14,height:14,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:done?"rgba(59,130,246,0.2)":active?"rgba(0,212,255,0.15)":"transparent",border:`1px solid ${done?"#3b82f6":active?CYAN:"#1e293b"}`,boxShadow:active?`0 0 8px rgba(0,212,255,0.5)`:"none"}}>
                {done&&<span style={{fontSize:9,color:"#3b82f6"}}>✓</span>}
                {active&&<div style={{width:5,height:5,borderRadius:"50%",background:CYAN,animation:"breathe 0.8s infinite"}} />}
              </div>
              <span style={{fontFamily:MONO,fontSize:9,color:done?"#3b82f6":active?"#d1e8ff":"#1e293b"}}>{s}</span>
            </div>
          );
        })}
      </div>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
        <div style={{position:"relative",width:120,height:120}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{position:"absolute",inset:i*18,borderRadius:"50%",border:`${i===0?2:1}px solid rgba(0,212,255,${0.55-i*0.14})`,animation:`spin-cw ${1.6+i*0.8}s linear infinite`,animationDirection:i%2?"reverse":"normal",boxShadow:i===0?`0 0 16px rgba(0,212,255,0.25)`:"none"}} />
          ))}
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:CYAN,fontFamily:MONO,fontSize:18,fontWeight:800,lineHeight:1}}>{Math.round(progress*100)}</span>
            <span style={{color:"rgba(0,212,255,0.4)",fontFamily:MONO,fontSize:8,marginTop:2}}>%</span>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:CYAN,fontFamily:MONO,fontSize:13,fontWeight:700,letterSpacing:"0.18em",textShadow:`0 0 20px rgba(0,212,255,0.6)`}}>{stage.toUpperCase()}</div>
          <div style={{color:"rgba(0,212,255,0.35)",fontFamily:MONO,fontSize:10,marginTop:6}}>ELAPSED {elapsed.toFixed(1)}s</div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 20px",...glass(0.12,10),borderTop:"1px solid rgba(0,200,255,0.1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{color:"#475569",fontFamily:MONO,fontSize:10}}>ANALYSIS PROGRESS</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:"#334155",fontFamily:MONO,fontSize:10}}>{(progress*100).toFixed(1)}%</span>
            <Clock size={10} style={{color:"#334155"}} />
            <span style={{color:CYAN,fontFamily:MONO,fontSize:10}}>{elapsed.toFixed(1)}s</span>
          </div>
        </div>
        <div style={{height:5,borderRadius:3,background:"rgba(0,212,255,0.07)",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,width:`${progress*100}%`,background:`linear-gradient(90deg,#0ea5e9,${CYAN})`,boxShadow:"0 0 14px rgba(0,212,255,0.65)",transition:"width 0.08s linear"}} />
        </div>
      </div>
    </div>
  );
}

function ResultScoreReveal({result,onDone,T}:{result:RunResult;onDone:()=>void;T:Tx}){
  const conf=useCountUp(result.confidence,1400,1);
  const onDoneRef=useRef(onDone);
  useEffect(()=>{onDoneRef.current=onDone;});
  useEffect(()=>{
    const t=setTimeout(()=>onDoneRef.current(),3000);
    return()=>clearTimeout(t);
  },[]);
  const cc=confColor(result.confidence);
  const cr=confRgb(result.confidence);
  return(
    <div style={{position:"absolute",inset:0,zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",...glass(0.18,20),background:"rgba(3,6,14,0.92)"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px)",backgroundSize:"44px 44px"}} />
      {[0,1,2,3].map(i=>(
        <div key={i} style={{position:"absolute",width:280+i*90,height:280+i*90,borderRadius:"50%",border:`1px solid rgba(${cr},${0.18-i*0.04})`,animation:`ring-expand ${0.6+i*0.18}s cubic-bezier(0.22,1,0.36,1) both`,animationDelay:`${i*0.07}s`}} />
      ))}
      <div style={{position:"relative",textAlign:"center",animation:"score-reveal 900ms cubic-bezier(0.22,1,0.36,1) both"}}>
        <div style={{color:"rgba(0,212,255,0.35)",fontFamily:MONO,fontSize:11,letterSpacing:"0.25em",marginBottom:16}}>{T.resultReveal}</div>
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{color:cc,fontFamily:MONO,fontSize:108,fontWeight:800,lineHeight:1,letterSpacing:"-0.04em",textShadow:`0 0 60px rgba(${cr},0.55),0 0 120px rgba(${cr},0.25)`,animation:"score-num 700ms cubic-bezier(0.22,1,0.36,1) 200ms both"}}>
            {conf.toFixed(1)}<span style={{fontSize:40,fontWeight:400,opacity:0.7}}>%</span>
          </div>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center,rgba(${cr},0.12) 0%,transparent 70%)`,pointerEvents:"none"}} />
        </div>
        <div style={{color:"rgba(0,200,255,0.4)",fontFamily:MONO,fontSize:12,letterSpacing:"0.22em",marginTop:10,marginBottom:16}}>{T.confidenceScore}</div>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:14}}>
          <span style={{padding:"5px 16px",borderRadius:6,background:`rgba(${cr},0.1)`,border:`1px solid rgba(${cr},0.4)`,color:cc,fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.1em"}}>{result.success?T.matchFound:T.noMatch}</span>
          <span style={{color:"#334155",fontFamily:MONO,fontSize:11}}>{result.params.method}</span>
        </div>
        <div style={{marginTop:22,color:"rgba(0,212,255,0.2)",fontFamily:MONO,fontSize:10,letterSpacing:"0.12em",animation:"breathe 1.5s ease-in-out infinite"}}>● LOADING VISUALIZATION ●</div>
      </div>
    </div>
  );
}

const RADAR_SERIES = [
  {label:"NCC",         color:"#3b82f6", key:"NCC"    as const},
  {label:"Feature-Based",color:"#8b5cf6", key:"Feature" as const},
  {label:"Hybrid AI",   color:"#00d4ff", key:"Hybrid"  as const},
] as const;

function SvgRadar(){
  const VW=340, VH=270, cx=VW/2, cy=VH/2-8, R=96;
  const n=RADAR_DATA.length;
  const ang=(i:number)=>(i/n)*2*Math.PI - Math.PI/2;
  const pt=(val:number,i:number)=>{
    const a=ang(i);
    return [cx+Math.cos(a)*val*R, cy+Math.sin(a)*val*R] as [number,number];
  };
  const gridLevels=[0.2,0.4,0.6,0.8,1.0];
  return(
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{width:"100%",height:240,display:"block"}}>
      {gridLevels.map(lv=>{
        const pts=RADAR_DATA.map((_,i)=>pt(lv,i).join(",")).join(" ");
        return <polygon key={`g${lv}`} points={pts} fill="none" stroke="rgba(0,200,255,0.1)" strokeWidth="1" />;
      })}
      {RADAR_DATA.map((_,i)=>{
        const [ex,ey]=pt(1,i);
        return <line key={`s${i}`} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(0,200,255,0.07)" strokeWidth="0.5" />;
      })}
      {RADAR_SERIES.map(({label,color,key})=>{
        const pts=RADAR_DATA.map((d,i)=>pt((d[key] as number)/100,i).join(",")).join(" ");
        return(
          <polygon key={label} points={pts}
            fill={color} fillOpacity={0.1}
            stroke={color} strokeWidth={1.8}
            strokeLinejoin="round" />
        );
      })}
      {RADAR_DATA.map((d,i)=>{
        const a=ang(i);
        const lx=cx+Math.cos(a)*(R+18);
        const ly=cy+Math.sin(a)*(R+18);
        return(
          <text key={`l${i}`} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(0,200,255,0.5)" fontSize={9} fontFamily={MONO}>
            {d.metric}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r="2" fill="rgba(0,200,255,0.3)" />
    </svg>
  );
}

function ModelGuide({selected,onSelect,T}:{selected:Method;onSelect:(m:Method)=>void;T:Tx}){
  const[tab,setTab]=useState<"radar"|"bench">("radar");
  return(
    <section className="guide-in" style={{padding:"28px 28px 36px",borderTop:"1px solid rgba(255,255,255,0.07)",...glassW(0.05,16)}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <BookOpen size={14} style={{color:"rgba(255,255,255,0.5)"}} />
          <h2 style={{fontFamily:MONO,fontSize:14,fontWeight:700,letterSpacing:"0.15em",color:"rgba(255,255,255,0.8)"}}>{T.algoGuide}</h2>
        </div>
        <div style={{display:"flex",gap:5}}>
          {(["radar","bench"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 14px",borderRadius:7,fontFamily:MONO,fontSize:10,letterSpacing:"0.08em",cursor:"pointer",...(tab===t?{background:"rgba(0,212,255,0.14)",border:"1px solid rgba(0,212,255,0.4)",color:CYAN}:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)"})}}>
              {t==="radar"?T.perf:T.bench}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        {tab==="radar"?(
          <>
            <GlassCard style={{borderRadius:12,padding:"16px 8px 8px"}} glassAlpha={0.06} glassBlur={16}>
              <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,letterSpacing:"0.18em",textAlign:"center",marginBottom:4}}>MULTI-DIMENSION PERFORMANCE</div>
              <SvgRadar />
              <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:6}}>
                {[{c:"#3b82f6",l:"NCC"},{c:"#8b5cf6",l:"Feature-Based"},{c:CYAN,l:"Hybrid AI"}].map(({c,l})=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:10,height:2,borderRadius:1,background:c}} />
                    <span style={{color:"#475569",fontFamily:MONO,fontSize:9}}>{l}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard style={{borderRadius:12,padding:16,overflow:"hidden"}} glassAlpha={0.06} glassBlur={16}>
              <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,letterSpacing:"0.18em",marginBottom:12}}>DIMENSION SCORES</div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 44px 44px 44px",gap:4,padding:"4px 6px",marginBottom:2}}>
                  {["DIMENSION","NCC","FEAT","AI"].map(h=>(
                    <span key={h} style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,letterSpacing:"0.12em",textAlign:h==="DIMENSION"?"left":"center"}}>{h}</span>
                  ))}
                </div>
                {RADAR_DATA.map(row=>(
                  <div key={row.metric} style={{display:"grid",gridTemplateColumns:"1fr 44px 44px 44px",gap:4,padding:"7px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",borderRadius:5}}>
                    <span style={{color:"rgba(255,255,255,0.55)",fontFamily:MONO,fontSize:9}}>{row.metric}</span>
                    {[{v:row.NCC,c:"#3b82f6"},{v:row.Feature,c:"#8b5cf6"},{v:row.Hybrid,c:CYAN}].map(({v,c},i)=>(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <span style={{color:c,fontFamily:MONO,fontSize:10,fontWeight:700}}>{v}</span>
                        <div style={{width:"100%",height:2,borderRadius:1,background:"rgba(0,200,255,0.06)"}}>
                          <div style={{height:"100%",borderRadius:1,width:`${v}%`,background:c,opacity:0.6}} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        ):(
          <GlassCard style={{borderRadius:12,padding:"16px 8px 8px",gridColumn:"1/-1"}} glassAlpha={0.06} glassBlur={16}>
            <div style={{color:"rgba(0,212,255,0.38)",fontFamily:MONO,fontSize:9,letterSpacing:"0.18em",textAlign:"center",marginBottom:8}}>SCENARIO BENCHMARK — CONFIDENCE SCORE BY USE CASE</div>
            <div style={{width:"100%",overflowX:"auto"}}>
              <BarChart data={SCENARIO_DATA} width={680} height={200}
                margin={{top:4,right:16,bottom:0,left:0}} barGap={2} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,200,255,0.06)" vertical={false} />
                <XAxis dataKey="case" tick={{fill:"rgba(0,200,255,0.35)",fontSize:8,fontFamily:MONO}} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{fill:"rgba(0,200,255,0.25)",fontSize:8,fontFamily:MONO}} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{background:"rgba(4,8,20,0.97)",border:"1px solid rgba(0,200,255,0.2)",borderRadius:6,fontFamily:MONO,fontSize:10}} labelStyle={{color:CYAN,letterSpacing:"0.1em"}} itemStyle={{color:"#94a3b8"}} />
                <Bar key="bar-ncc" dataKey="NCC" name="NCC" fill="#3b82f6" radius={[2,2,0,0]} maxBarSize={16} isAnimationActive={false} />
                <Bar key="bar-feat" dataKey="Feature" name="Feature-Based" fill="#8b5cf6" radius={[2,2,0,0]} maxBarSize={16} isAnimationActive={false} />
                <Bar key="bar-hybrid" dataKey="Hybrid" name="Hybrid AI" fill={CYAN} radius={[2,2,0,0]} maxBarSize={16} isAnimationActive={false} />
                <Legend formatter={(v:string)=><span style={{color:"#475569",fontFamily:MONO,fontSize:9}}>{v==="Feature"?"Feature-Based":v==="Hybrid"?"Hybrid AI":v}</span>} />
              </BarChart>
            </div>
          </GlassCard>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {MODEL_CARDS.map(mc=>{
          const isSel=selected===mc.id;
          return(
            <GlassCard key={mc.id} onClick={()=>onSelect(mc.id)} glassAlpha={isSel?0.10:0.06} glassBlur={isSel?20:16}
              style={{borderRadius:14,padding:16,border:`1px solid ${isSel?mc.color:"rgba(255,255,255,0.1)"}`,boxShadow:isSel?`0 0 28px ${mc.color}22 inset,0 0 48px ${mc.color}0f`:"none",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:mc.color,boxShadow:`0 0 9px ${mc.color}`}} />
                    <span style={{color:mc.color,fontFamily:MONO,fontSize:10,fontWeight:700,letterSpacing:"0.1em"}}>{mc.id}</span>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.65)",fontFamily:SANS,fontSize:11,fontWeight:500,lineHeight:1.3}}>{mc.title}</div>
                </div>
                <span style={{flexShrink:0,fontFamily:MONO,fontSize:8,padding:"3px 8px",borderRadius:5,background:`${mc.color}22`,border:`1px solid ${mc.color}55`,color:mc.color,letterSpacing:"0.08em"}}>{mc.badge}</span>
              </div>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:10,lineHeight:1.65,marginBottom:12}}>{mc.desc}</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div>
                  <div style={{color:"#34d399",fontFamily:MONO,fontSize:8,letterSpacing:"0.14em",marginBottom:5}}>STRENGTHS</div>
                  {mc.pros.map(p=><div key={p} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:"#34d399",fontSize:9,flexShrink:0}}>+</span><span style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,lineHeight:1.4}}>{p}</span></div>)}
                </div>
                <div>
                  <div style={{color:"#f87171",fontFamily:MONO,fontSize:8,letterSpacing:"0.14em",marginBottom:5}}>LIMITATIONS</div>
                  {mc.cons.map(c=><div key={c} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:"#f87171",fontSize:9,flexShrink:0}}>−</span><span style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,lineHeight:1.4}}>{c}</span></div>)}
                </div>
                <div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:8,letterSpacing:"0.14em",marginBottom:5}}>BEST FOR</div>
                  {mc.best.map(b=><div key={b} style={{display:"flex",gap:5,marginBottom:3}}><span style={{color:"rgba(255,255,255,0.35)",fontSize:9,flexShrink:0}}>›</span><span style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,lineHeight:1.4}}>{b}</span></div>)}
                </div>
                <div style={{marginTop:2,padding:"8px 10px",borderRadius:8,background:`${mc.color}10`,border:`1px solid ${mc.color}30`}}>
                  <div style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:7,letterSpacing:"0.12em",marginBottom:4}}>RECOMMENDED PARAMS</div>
                  <div style={{color:`${mc.color}cc`,fontFamily:MONO,fontSize:8,lineHeight:1.6}}>{mc.params}</div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

const LANG_LABELS:Record<Lang,string>={"en":"EN","hi":"हि","ta":"த","fr":"FR"};
const LANG_NAMES:Record<Lang,string>={"en":"English","hi":"हिन्दी","ta":"தமிழ்","fr":"Français"};

function LangPicker({lang,onChange,light=false}:{lang:Lang;onChange:(l:Lang)=>void;light?:boolean}){
  const[open,setOpen]=useState(false);
  const[dropPos,setDropPos]=useState({top:0,right:0});
  const btnRef=useRef<HTMLButtonElement>(null);
  const dropRef=useRef<HTMLDivElement>(null);

  const handleToggle=()=>{
    if(!open&&btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      setDropPos({top:r.bottom+6,right:window.innerWidth-r.right});
    }
    setOpen(o=>!o);
  };

  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{
      const t=e.target as Node;
      const inBtn=btnRef.current?.contains(t);
      const inDrop=dropRef.current?.contains(t);
      if(!inBtn&&!inDrop) setOpen(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[open]);

  const borderColor=light?"rgba(255,255,255,0.18)":"rgba(0,200,255,0.2)";
  const textColor=light?"rgba(255,255,255,0.8)":"rgba(0,212,255,0.75)";

  return(
    <div style={{position:"relative",display:"inline-flex"}}>
      <button ref={btnRef} onClick={handleToggle}
        style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,
          background:open?(light?"rgba(255,255,255,0.14)":"rgba(0,212,255,0.12)"):(light?"rgba(255,255,255,0.07)":"rgba(0,212,255,0.05)"),
          border:`1px solid ${open?textColor:borderColor}`,color:textColor,
          fontFamily:MONO,fontSize:10,cursor:"pointer",letterSpacing:"0.1em",
          transition:"all 0.18s",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
        <Globe size={11} />
        <span style={{fontWeight:600}}>{LANG_LABELS[lang]}</span>
        <span style={{color:light?"rgba(255,255,255,0.4)":"rgba(0,212,255,0.4)",fontSize:9,marginLeft:1}}>{LANG_NAMES[lang]}</span>
        <ChevronDown size={9} style={{opacity:0.55,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.22s",marginLeft:2}} />
      </button>

      {open&&(
        <div ref={dropRef}
          style={{position:"fixed",top:dropPos.top,right:dropPos.right,zIndex:9999,minWidth:158,
            borderRadius:10,background:"rgba(3,8,22,0.98)",
            border:"1px solid rgba(0,200,255,0.22)",
            boxShadow:"0 16px 48px rgba(0,0,0,0.8),0 0 0 1px rgba(0,200,255,0.08)",
            overflow:"hidden",animation:"lang-drop 180ms cubic-bezier(0.22,1,0.36,1)"}}>
          <div style={{padding:"7px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",
            background:"rgba(0,200,255,0.04)"}}>
            <span style={{color:"rgba(0,212,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.2em"}}>
              SELECT LANGUAGE
            </span>
          </div>
          {(["en","hi","ta","fr"] as Lang[]).map(l=>{
            const active=lang===l;
            return(
              <button key={l}
                onMouseDown={e=>{e.stopPropagation();}}
                onClick={()=>{onChange(l);setOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",
                  border:"none",background:active?"rgba(0,212,255,0.1)":"transparent",
                  color:active?CYAN:"rgba(255,255,255,0.55)",fontFamily:MONO,fontSize:10,
                  cursor:"pointer",letterSpacing:"0.05em",textAlign:"left",
                  transition:"background 0.14s",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{minWidth:22,fontWeight:active?700:400,fontSize:11}}>{LANG_LABELS[l]}</span>
                <span style={{color:active?"rgba(0,212,255,0.65)":"rgba(255,255,255,0.32)",fontSize:10,flex:1}}>{LANG_NAMES[l]}</span>
                {active&&<span style={{color:CYAN,fontSize:12,marginLeft:4}}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DriftCompass({driftX,driftY,maxR}:{driftX:number;driftY:number;maxR:number}){
  const S=130,cx=S/2,cy=S/2,R=50;
  const mag=Math.sqrt(driftX**2+driftY**2);
  const norm=mag>0?Math.min(1,mag/(Math.max(maxR,1)*0.6)):0;
  const angle=Math.atan2(driftY,driftX);
  const ax=cx+Math.cos(angle)*norm*R*0.78;
  const ay=cy+Math.sin(angle)*norm*R*0.78;
  const hLen=11,hW=0.42;
  const hx1=ax-hLen*Math.cos(angle-hW),hy1=ay-hLen*Math.sin(angle-hW);
  const hx2=ax-hLen*Math.cos(angle+hW),hy2=ay-hLen*Math.sin(angle+hW);
  const dirs=[{l:"N",d:-90},{l:"E",d:0},{l:"S",d:90},{l:"W",d:180}];
  return(
    <svg width={S} height={S}>
      {[1,0.67,0.33].map((s,i)=>(
        <circle key={i} cx={cx} cy={cy} r={R*s} fill="none"
          stroke={`rgba(0,200,255,${0.13-i*0.03})`} strokeWidth="1"
          strokeDasharray={i>0?"3 5":""} />
      ))}
      <line x1={cx-R} y1={cy} x2={cx+R} y2={cy} stroke="rgba(0,200,255,0.08)" strokeWidth="0.5" />
      <line x1={cx} y1={cy-R} x2={cx} y2={cy+R} stroke="rgba(0,200,255,0.08)" strokeWidth="0.5" />
      {dirs.map(({l,d})=>{
        const rad=d*Math.PI/180;
        return(
          <React.Fragment key={l}>
            <line x1={cx+Math.cos(rad)*(R-5)} y1={cy+Math.sin(rad)*(R-5)}
              x2={cx+Math.cos(rad)*R} y2={cy+Math.sin(rad)*R}
              stroke="rgba(0,200,255,0.25)" strokeWidth="1.5" />
            <text x={cx+Math.cos(rad)*(R+11)} y={cy+Math.sin(rad)*(R+11)+3}
              textAnchor="middle" fill="rgba(0,200,255,0.32)" fontSize="8" fontFamily="monospace">{l}</text>
          </React.Fragment>
        );
      })}
      {mag>0.5&&(
        <>
          <line x1={cx} y1={cy} x2={ax} y2={ay}
            stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 4px #f59e0b)"}} />
          <polygon points={`${ax},${ay} ${hx1},${hy1} ${hx2},${hy2}`} fill="#f59e0b" />
          <circle cx={cx} cy={cy} r={norm*R*0.78} fill="none"
            stroke="rgba(245,158,11,0.1)" strokeWidth="1" strokeDasharray="2 4" />
        </>
      )}
      <circle cx={cx} cy={cy} r="4" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="2" fill={CYAN} style={{filter:"drop-shadow(0 0 4px #00d4ff)"}} />
      <text x={cx} y={S-4} textAnchor="middle" fill="rgba(0,200,255,0.25)" fontSize="7" fontFamily="monospace">
        {mag.toFixed(1)}nm · {(angle*180/Math.PI).toFixed(0)}°
      </text>
    </svg>
  );
}

function MiniSparkline({values,color,w=160,h=36}:{values:number[];color:string;w?:number;h?:number}){
  if(values.length<2) return null;
  const min=Math.min(...values),max=Math.max(...values);
  const range=max-min||1;
  const pts=values.map((v,i)=>`${(i/(values.length-1))*w},${h-((v-min)/range)*(h-4)-2}`).join(" ");
  const lastX=(values.length-1)/(values.length-1)*w;
  const lastY=h-((values[values.length-1]-min)/range)*(h-4)-2;
  return(
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${color.replace("#","")})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color}
        style={{filter:`drop-shadow(0 0 3px ${color})`}} />
    </svg>
  );
}

function GaugeRing({value,max=100,color,label,size=72}:{value:number;max?:number;color:string;label:string;size?:number}){
  const pct=Math.min(1,value/max);
  const r=28,circumf=2*Math.PI*r;
  const dash=pct*circumf;
  const cx=size/2,cy=size/2;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circumf}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 6px ${color})`,transition:"stroke-dasharray 1s ease-out"}} />
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="12" fontFamily="monospace" fontWeight="700"
          style={{transform:"rotate(90deg)",transformOrigin:`${cx}px ${cy}px`}}>
          {Math.round(pct*100)}
        </text>
      </svg>
      <span style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:8,letterSpacing:"0.1em"}}>{label}</span>
    </div>
  );
}

export default function App(){
  const[screen,setScreen]   =useState<Screen>("upload");
  const[lang,setLang]       =useState<Lang>("en");
  const T=TRANS[lang];

  const[file,setFile]       =useState<File|null>(null);
  const[imageUrl,setImgUrl] =useState("");
  const[imgDims,setImgDims] =useState({w:0,h:0});
  const[params,setParams]   =useState<Params>({patchSize:64,searchRadius:80,threshold:0.75,method:"Hybrid AI"});
  const[suggestion,setSugg] =useState<Suggestion|null>(null);
  const[showSugg,setShowSugg]=useState(false);
  const[progress,setProg]   =useState(0);
  const[stageIdx,setStage]  =useState(0);
  const[elapsed,setElapsed] =useState(0);
  const[result,setResult]   =useState<RunResult|null>(null);
  const[resultPhase,setPhase]=useState<ResultPhase>("full");
  const[history,setHistory] =useState<RunResult[]>([]);
  const[histImgs,setHImgs]  =useState<Record<number,string>>({});
  const[showHeat,setHeat]   =useState(true);
  const[corrected,setCorr]  =useState(false);
  const[dragOver,setDrag]   =useState(false);
  const[runCount,setRuns]   =useState(0);
  const[zoom,setZoom]       =useState(1);
  const[pan,setPan]         =useState({x:0,y:0});
  const[panning,setPanning] =useState(false);
  const[badgeAnim,setBadge] =useState("");
  const[activeSlider,setSlider]=useState<string|null>(null);
  const[resultTs,setResultTs]=useState(0);
  const[flipping,setFlipping]=useState(false);
  const[flipUrl,setFlipUrl] =useState("");
  const[clockTick,setClockTick]=useState(()=>Date.now());
  const[sessionId]=useState(()=>`DS-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`);

  const fileInputRef =useRef<HTMLInputElement>(null);
  const imageRef     =useRef<HTMLImageElement>(null);
  const canvasRef    =useRef<HTMLCanvasElement>(null);
  const panStart     =useRef({mx:0,my:0,px:0,py:0});
  const isPanning    =useRef(false);
  const elapsedTimer =useRef<ReturnType<typeof setInterval>|null>(null);
  const rafRef       =useRef<number>(0);
  const canvasRaf    =useRef<number>(0);
  const resultsRef   =useRef<HTMLDivElement>(null);
  const mainScrollRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el=document.createElement("style"); el.textContent=GLOBAL_CSS;
    document.head.appendChild(el); return()=>document.head.removeChild(el);
  },[]);

  useEffect(()=>{
    const t=setInterval(()=>setClockTick(Date.now()),1000);
    return()=>clearInterval(t);
  },[]);

  const orbitAngle=Math.round((clockTick/1000*3.6)%360);
  const orbitAlt=402+Math.round(Math.sin(clockTick/40000)*6*10)/10;
  const orbitVel=7.66+Math.round(Math.sin(clockTick/25000)*0.04*1000)/1000;
  const clockStr=new Date(clockTick).toLocaleTimeString("en-US",{hour12:false});

  const animConf =useCountUp(result?.confidence??0,850,1);
  const animDX   =useCountUp(result?.driftX??0,680,1);
  const animDY   =useCountUp(result?.driftY??0,680,1);
  const animMag  =useCountUp(result?driftMag(result):0,720,1);
  const animTime =useCountUp(result?.processingTime??0,620,2);

  useEffect(()=>{
    if(screen==="results"&&resultPhase==="full"&&resultsRef.current)
      setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),350);
  },[screen,resultPhase]);

  const handleFile=useCallback((f:File)=>{
    if(!f.type.startsWith("image/")) return;
    const url=URL.createObjectURL(f);
    setFlipUrl(url); setFlipping(true);
    const img=new Image();
    img.onload=()=>{
      const dims={w:img.naturalWidth,h:img.naturalHeight};
      setTimeout(()=>{
        setFile(f); setImgUrl(url); setImgDims(dims);
        setSugg(computeSuggestion(f,dims)); setShowSugg(true);
        setResult(null); setPhase("full"); setCorr(false); setZoom(1); setPan({x:0,y:0});
        setFlipping(false); setScreen("configure");
      },920);
    };
    img.src=url;
  },[]);

  const onDrop=(e:DragEvent<HTMLDivElement>)=>{
    e.preventDefault(); setDrag(false);
    const f=e.dataTransfer.files[0]; if(f) handleFile(f);
  };

  const toFull =useCallback(()=>setPhase("full"),[]);

  useEffect(()=>{
    const el=mainScrollRef.current; if(!el) return;
    const onScroll=()=>{ if(el.scrollTop<60){ setZoom(1); setPan({x:0,y:0}); } };
    el.addEventListener("scroll",onScroll,{passive:true});
    return()=>el.removeEventListener("scroll",onScroll);
  },[]);

  const runAnalysis=useCallback(async()=>{
    if(!file) return;
    if(elapsedTimer.current) clearInterval(elapsedTimer.current);
    cancelAnimationFrame(rafRef.current);
    setScreen("processing"); setProg(0); setStage(0); setElapsed(0); setCorr(false); setPhase("full");
    if(mainScrollRef.current) mainScrollRef.current.scrollTop=0;
    const t0=Date.now();
    elapsedTimer.current=setInterval(()=>setElapsed(Math.round((Date.now()-t0)/100)/10),100);
    let prev=0;
    for(let i=0;i<T.stages.length;i++){
      setStage(i);
      const from=prev,to=STAGE_ENDS[i],dur=STAGE_DUR[i]; prev=to;
      await new Promise<void>(resolve=>{
        const s0=Date.now();
        const tick=()=>{
          const t=Math.min(1,(Date.now()-s0)/dur);
          const e=t<0.5?4*t**3:1-(-2*t+2)**3/2;
          setProg(from+e*(to-from));
          if(t<1) rafRef.current=requestAnimationFrame(tick); else resolve();
        };
        rafRef.current=requestAnimationFrame(tick);
      });
    }
    if(elapsedTimer.current) clearInterval(elapsedTimer.current);
    const newId=runCount+1; setRuns(newId);
    const r=simulate(file,params,imgDims.w,imgDims.h,newId);
    const thumb=URL.createObjectURL(file);
    setResult(r); setHImgs(p=>({...p,[newId]:thumb}));
    setHistory(p=>[r,...p].slice(0,16));
    setResultTs(Date.now());
    setBadge(r.success?"badge-success":"badge-fail");
    setTimeout(()=>setBadge(""),1200);
    setPhase("score");
    setScreen("results");
  },[file,params,imgDims,runCount,T.stages]);

  useEffect(()=>{
    if(screen!=="results"||!result||resultPhase!=="full") return;
    cancelAnimationFrame(canvasRaf.current);
    const res=result,ht=showHeat,cor=corrected,rad=params.searchRadius,ts=resultTs;
    const draw=()=>{
      const canvas=canvasRef.current,imgEl=imageRef.current;
      if(!canvas||!imgEl){canvasRaf.current=requestAnimationFrame(draw);return;}
      const W=imgEl.offsetWidth,H=imgEl.offsetHeight;
      if(!W||!H){canvasRaf.current=requestAnimationFrame(draw);return;}
      if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
      const ctx=canvas.getContext("2d")!;
      ctx.clearRect(0,0,W,H);
      const now=Date.now(),age=(now-ts)/1000,pulse=Math.sin(now*0.00195)*0.5+0.5;
      ctx.font=`8px ${MONO}`;ctx.fillStyle="rgba(0,200,255,0.2)";ctx.strokeStyle="rgba(0,200,255,0.2)";
      const tk=Math.max(50,Math.round(W/8));
      for(let x=tk;x<W-10;x+=tk){ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,5);ctx.stroke();ctx.fillText(`${Math.round(x/W*1000)}`,x-10,15);}
      for(let y=tk;y<H-10;y+=tk){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(5,y);ctx.stroke();ctx.save();ctx.translate(14,y+10);ctx.rotate(-Math.PI/2);ctx.fillText(`${Math.round(y/H*1000)}`,0,0);ctx.restore();}
      ctx.fillStyle="rgba(0,200,255,0.14)";ctx.font=`7px ${MONO}`;ctx.fillText("nm",2,13);
      if(ht){
        const hcx=(res.bbox.x+res.bbox.w/2)*W,hcy=(res.bbox.y+res.bbox.h/2)*H;
        const g=ctx.createRadialGradient(hcx,hcy,0,hcx,hcy,Math.max(W,H)*0.55);
        const a=(res.confidence/100)*0.45;
        g.addColorStop(0,`rgba(255,50,50,${a})`);g.addColorStop(0.15,`rgba(255,200,0,${a*0.82})`);
        g.addColorStop(0.35,`rgba(0,212,255,${a*0.62})`);g.addColorStop(0.6,`rgba(0,60,200,${a*0.32})`);
        g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
        ctx.strokeStyle="rgba(0,212,255,0.025)";ctx.lineWidth=1;
        for(let y=0;y<H;y+=3){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
        const cg=ctx.createLinearGradient(0,H-88,0,H-22);
        cg.addColorStop(0,"rgba(255,50,50,0.9)");cg.addColorStop(0.33,"rgba(255,200,0,0.9)");
        cg.addColorStop(0.66,"rgba(0,212,255,0.9)");cg.addColorStop(1,"rgba(0,30,150,0.9)");
        ctx.fillStyle=cg;ctx.fillRect(W-17,H-88,8,66);
        ctx.strokeStyle="rgba(255,255,255,0.16)";ctx.lineWidth=1;ctx.strokeRect(W-17,H-88,8,66);
        ctx.fillStyle="rgba(255,255,255,0.45)";ctx.font=`8px ${MONO}`;
        ctx.fillText("HI",W-33,H-83);ctx.fillText("LO",W-32,H-19);
      }
      if(!res.success){canvasRaf.current=requestAnimationFrame(draw);return;}
      const bx=res.bbox.x*W,by=res.bbox.y*H,bw=res.bbox.w*W,bh=res.bbox.h*H;
      const ccx=bx+bw/2,ccy=by+bh/2;
      ctx.fillStyle="rgba(0,0,0,0.33)";ctx.fillRect(0,0,W,H);ctx.clearRect(bx-3,by-3,bw+6,bh+6);
      const feat=ctx.createRadialGradient(ccx,ccy,Math.min(bw,bh)*0.4,ccx,ccy,Math.max(bw,bh)*1.15);
      feat.addColorStop(0,"rgba(0,0,0,0)");feat.addColorStop(1,"rgba(0,0,0,0.36)");
      ctx.fillStyle=feat;ctx.fillRect(0,0,W,H);
      if(age<1.4){
        const p=age/1.4,swX=bx+bw*p;
        const sg=ctx.createLinearGradient(swX-14,0,swX+14,0);
        sg.addColorStop(0,"rgba(0,212,255,0)");sg.addColorStop(0.5,`rgba(0,212,255,${0.55*Math.sin(p*Math.PI)})`);sg.addColorStop(1,"rgba(0,212,255,0)");
        ctx.fillStyle=sg;ctx.fillRect(swX-14,by,28,bh);
      }
      ctx.shadowColor=CYAN;ctx.shadowBlur=16+pulse*14;ctx.strokeStyle=`rgba(0,212,255,${0.13+pulse*0.12})`;ctx.lineWidth=10;ctx.strokeRect(bx,by,bw,bh);ctx.shadowBlur=0;
      ctx.shadowColor=CYAN;ctx.shadowBlur=5;ctx.strokeStyle=CYAN;ctx.lineWidth=1.5;ctx.strokeRect(bx,by,bw,bh);ctx.shadowBlur=0;
      const cs=Math.min(bw,bh)*0.25;ctx.lineWidth=2.5;ctx.strokeStyle="#00ffff";ctx.shadowColor="#00ffff";ctx.shadowBlur=8;
      ([[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]] as [number,number,number,number][]).forEach(([x2,y2,sx,sy])=>{
        ctx.beginPath();ctx.moveTo(x2+sx*cs,y2);ctx.lineTo(x2,y2);ctx.lineTo(x2,y2+sy*cs);ctx.stroke();
      });ctx.shadowBlur=0;
      ctx.fillStyle=CYAN;ctx.shadowColor=CYAN;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(ccx,ccy,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      if(!cor){
        const sc=(Math.min(W,H)*0.1)/Math.max(rad,1),dx=res.driftX*sc,dy=res.driftY*sc;
        if(Math.hypot(dx,dy)>4){
          ctx.strokeStyle="#f59e0b";ctx.fillStyle="#f59e0b";ctx.lineWidth=1.5;ctx.shadowColor="#f59e0b";ctx.shadowBlur=6;
          ctx.beginPath();ctx.moveTo(ccx,ccy);ctx.lineTo(ccx+dx,ccy+dy);ctx.stroke();
          const ang=Math.atan2(dy,dx),al=9;
          ctx.beginPath();ctx.moveTo(ccx+dx,ccy+dy);
          ctx.lineTo(ccx+dx-al*Math.cos(ang-0.43),ccy+dy-al*Math.sin(ang-0.43));
          ctx.lineTo(ccx+dx-al*Math.cos(ang+0.43),ccy+dy-al*Math.sin(ang+0.43));
          ctx.closePath();ctx.fill();ctx.shadowBlur=0;
        }
      }else{
        ctx.strokeStyle=`rgba(16,185,129,${0.45+pulse*0.3})`;ctx.lineWidth=2;ctx.shadowColor="#10b981";ctx.shadowBlur=8+pulse*8;
        ctx.beginPath();ctx.arc(ccx,ccy,Math.min(bw,bh)*0.54,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
      }
      const tag=`REF · ${res.confidence.toFixed(1)}%`;ctx.font=`bold 10px ${MONO}`;const tw=ctx.measureText(tag).width;
      ctx.fillStyle="rgba(2,8,22,0.94)";ctx.beginPath();ctx.roundRect(bx-2,by-26,tw+14,22,3);ctx.fill();
      ctx.strokeStyle=`rgba(${confRgb(res.confidence)},0.5)`;ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=confColor(res.confidence);ctx.fillText(tag,bx+5,by-9);
      canvasRaf.current=requestAnimationFrame(draw);
    };
    const t=setTimeout(()=>{cancelAnimationFrame(canvasRaf.current);draw();},80);
    const ro=new ResizeObserver(()=>{
      if(canvasRef.current&&imageRef.current){canvasRef.current.width=imageRef.current.offsetWidth;canvasRef.current.height=imageRef.current.offsetHeight;}
    });
    if(imageRef.current) ro.observe(imageRef.current);
    return()=>{clearTimeout(t);cancelAnimationFrame(canvasRaf.current);ro.disconnect();};
  },[screen,result,resultPhase,showHeat,corrected,params.searchRadius,resultTs]);

  const onWheel=(e:React.WheelEvent)=>{e.preventDefault();setZoom(z=>Math.max(0.4,Math.min(7,z*(1-e.deltaY*0.0012))));};
  const onMDown=(e:React.MouseEvent)=>{if(e.button!==0)return;isPanning.current=true;setPanning(true);panStart.current={mx:e.clientX,my:e.clientY,px:pan.x,py:pan.y};};
  const onMMove=(e:React.MouseEvent)=>{if(!isPanning.current)return;setPan({x:panStart.current.px+e.clientX-panStart.current.mx,y:panStart.current.py+e.clientY-panStart.current.my});};
  const onMUp=()=>{isPanning.current=false;setPanning(false);};

  const isProcessing=screen==="processing";
  const isResults   =screen==="results";
  const isDashboard =screen!=="upload";

  const FlipOverlay=flipping?(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(3,6,14,0.88)",backdropFilter:"blur(14px)"}}>
      <div style={{position:"relative",animation:"flip3d 920ms cubic-bezier(0.4,0,0.2,1) forwards"}}>
        <div style={{width:420,height:290,borderRadius:14,overflow:"hidden",border:`2px solid ${CYAN}`,boxShadow:`0 0 60px rgba(0,212,255,0.4)`}}>
          <img src={flipUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.85) contrast(1.15) saturate(0.7)"}} />
        </div>
      </div>
      <div style={{marginTop:32,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:CYAN,boxShadow:`0 0 10px ${CYAN}`,animation:"breathe 0.8s infinite"}} />
        <span style={{color:CYAN,fontFamily:MONO,fontSize:12,letterSpacing:"0.22em"}}>{T.loadingSensor}</span>
      </div>
    </div>
  ):null;

  if(!isDashboard) return(
    <div style={{width:"100%",height:"100vh",position:"relative",overflow:"hidden",background:"#020508",fontFamily:SANS}}>
      <VideoBackground />
      {FlipOverlay}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,rgba(0,4,14,0.42) 0%,rgba(1,8,20,0.24) 50%,rgba(0,4,14,0.48) 100%)",pointerEvents:"none"}} />
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.018) 1px,transparent 1px)",backgroundSize:"56px 56px",pointerEvents:"none"}} />
      {[{top:18,left:18},{top:18,right:18},{bottom:18,left:18},{bottom:18,right:18}].map((pos,i)=>(
        <div key={i} style={{position:"absolute",width:44,height:44,...pos}}>
          <div style={{position:"absolute",top:0,left:0,width:16,height:16,borderTop:"1.5px solid rgba(0,212,255,0.4)",borderLeft:"1.5px solid rgba(0,212,255,0.4)"}} />
          <div style={{position:"absolute",bottom:0,right:0,width:16,height:16,borderBottom:"1.5px solid rgba(0,212,255,0.4)",borderRight:"1.5px solid rgba(0,212,255,0.4)"}} />
        </div>
      ))}
      <div style={{position:"absolute",top:0,left:0,right:0,height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 36px",borderBottom:"1px solid rgba(0,212,255,0.12)",background:"rgba(0,4,16,0.55)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",boxShadow:"0 1px 0 rgba(0,212,255,0.08),0 4px 40px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:30,height:30,position:"relative",flexShrink:0}}>
            <div style={{position:"absolute",inset:0,borderRadius:8,background:"rgba(0,212,255,0.1)",border:"1.5px solid rgba(0,212,255,0.5)",boxShadow:"0 0 18px rgba(0,212,255,0.25)"}} />
            <div style={{position:"absolute",inset:7,borderRadius:3,background:CYAN,boxShadow:`0 0 10px ${CYAN}`}} />
          </div>
          <div>
            <div style={{color:"#e2e8f0",fontFamily:MONO,fontSize:13,fontWeight:800,letterSpacing:"0.22em",lineHeight:1}}>{T.appName}</div>
            <div style={{color:"rgba(0,212,255,0.45)",fontFamily:MONO,fontSize:8,letterSpacing:"0.26em",marginTop:2}}>SEMICONDUCTOR SEM ANALYSIS</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <LangPicker lang={lang} onChange={setLang} />
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 14px",borderRadius:20,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px #10b981",animation:"breathe 1.4s ease-in-out infinite"}} />
            <span style={{color:"#34d399",fontFamily:MONO,fontSize:10,letterSpacing:"0.14em"}}>{T.systemReady}</span>
          </div>
        </div>
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",height:"100%",gap:36,padding:"70px 32px 48px",overflowY:"auto"}}>
        <div style={{textAlign:"center",animation:"fade-up 600ms ease-out"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:9,marginBottom:22,padding:"5px 16px",borderRadius:20,...glass(0.07,6)}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 7px #10b981"}} />
            <span style={{color:"rgba(0,212,255,0.6)",fontFamily:MONO,fontSize:10,letterSpacing:"0.16em"}}>{T.aiPowered}</span>
          </div>
          <h1 style={{fontFamily:MONO,fontWeight:800,letterSpacing:"-0.025em",lineHeight:1.0,fontSize:"clamp(52px,7vw,80px)",marginBottom:18,background:"linear-gradient(145deg,#ffffff 0%,#b8e4ff 30%,#00d4ff 58%,#3b82f6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {T.appName}
          </h1>
          <p style={{color:"rgba(0,212,255,0.45)",fontFamily:MONO,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>{T.tagline}</p>
          <p style={{color:"#1e3040",fontFamily:MONO,fontSize:11}}>{T.subtitle}</p>
        </div>
        <GlassCard glassAlpha={0.05} glassBlur={16}
          style={{width:"100%",maxWidth:520,borderRadius:18,border:`2px dashed ${dragOver?CYAN:"rgba(0,200,255,0.22)"}`,cursor:"pointer",animation:"fade-up 700ms ease-out both",transition:"border-color 0.2s"}}
          onClick={()=>fileInputRef.current?.click()}>
          <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:"52px 40px"}}>
            <div style={{width:76,height:76,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",...glass(0.08,8),border:`1px solid rgba(0,212,255,${dragOver?"0.6":"0.25"})`,boxShadow:dragOver?"0 0 50px rgba(0,212,255,0.35)":"0 0 20px rgba(0,212,255,0.1)",transition:"all 0.22s"}}>
              <Upload size={32} style={{color:CYAN}} />
            </div>
            <div style={{textAlign:"center"}}>
              <p style={{color:dragOver?"#e2e8f0":"#c8dff0",fontSize:16,fontWeight:500,marginBottom:8}}>{dragOver?"Release to begin":T.uploadText}</p>
              <p style={{color:"#1e3040",fontFamily:MONO,fontSize:11}}>{T.dragHint}</p>
            </div>
          </div>
        </GlassCard>
        <div style={{display:"flex",alignItems:"center",gap:48,animation:"fade-up 800ms ease-out both"}}>
          {[
            {v:T.algorithms3,l:T.algorithms,sub:"NCC · Feature · Hybrid AI"},
            {v:T.precision01,l:T.precision,sub:"Sub-pixel accuracy"},
            {v:"< 4s",l:T.realtimeLbl,sub:"Per frame analysis"},
            {v:"99.6%",l:"Max Confidence",sub:"Hybrid AI peak score"},
          ].map(({v,l,sub})=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{color:CYAN,fontFamily:MONO,fontSize:22,fontWeight:700,textShadow:"0 0 14px rgba(0,212,255,0.5)"}}>{v}</div>
              <div style={{color:"#223344",fontFamily:SANS,fontSize:11,marginTop:3}}>{l}</div>
              <div style={{color:"#0f1c28",fontFamily:MONO,fontSize:9,marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{width:"100%",maxWidth:820,animation:"fade-up 900ms ease-out both"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <span style={{color:"rgba(0,212,255,0.3)",fontFamily:MONO,fontSize:9,letterSpacing:"0.22em"}}>HOW IT WORKS</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 28px 1fr 28px 1fr",alignItems:"center",gap:0}}>
            {[
              {n:"01",title:"Upload Image",desc:"Drop any SEM wafer JPEG or PNG. The AI instantly analyses resolution, texture density, and aspect ratio to suggest optimal parameters.",icon:"↑"},
              {n:"02",title:"Configure & Run",desc:"Choose NCC for speed, Feature-Based for robustness, or Hybrid AI for maximum accuracy. One click triggers the full pipeline.",icon:"⚡"},
              {n:"03",title:"Inspect Results",desc:"Confidence score, drift vector, correction coordinates and annotated heatmap — all in sub-4-second turnaround with session history.",icon:"◎"},
            ].map(({n,title,desc,icon},i)=>(
              <React.Fragment key={n}>
                <div style={{...glass(0.04,12),borderRadius:12,padding:"18px 16px",border:"1px solid rgba(0,200,255,0.1)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:10,right:12,fontFamily:MONO,fontSize:28,fontWeight:800,color:"rgba(0,212,255,0.04)",lineHeight:1}}>{n}</div>
                  <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",marginBottom:10,fontSize:16}}>{icon}</div>
                  <div style={{color:"#94a3b8",fontFamily:MONO,fontSize:11,fontWeight:700,marginBottom:6,letterSpacing:"0.06em"}}>{title}</div>
                  <div style={{color:"#1e3040",fontFamily:SANS,fontSize:10,lineHeight:1.6}}>{desc}</div>
                </div>
                {i<2&&<div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                  <div style={{width:20,height:1,background:"linear-gradient(90deg,rgba(0,212,255,0.2),rgba(0,212,255,0.05))"}} />
                  <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(0,212,255,0.2)",margin:"0 2px"}} />
                  <div style={{width:20,height:1,background:"linear-gradient(90deg,rgba(0,212,255,0.05),rgba(0,212,255,0.2))"}} />
                </div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,animation:"fade-up 1000ms ease-out both"}}>
          {[
            {label:"NCC",sub:"Ultra-fast",c:"#3b82f6"},
            {label:"Feature-Based",sub:"Rotation-robust",c:"#8b5cf6"},
            {label:"Hybrid AI",sub:"Best accuracy",c:"#00d4ff"},
            {label:"±0.1nm",sub:"Precision",c:"#10b981"},
            {label:"4 Languages",sub:"EN · हि · த · FR",c:"#f59e0b"},
            {label:"Session History",sub:"Up to 16 runs",c:"#64748b"},
          ].map(({label,sub,c})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",borderRadius:20,...glass(0.04,8),border:`1px solid ${c}22`}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`}} />
              <span style={{color:c,fontFamily:MONO,fontSize:10,fontWeight:600}}>{label}</span>
              <span style={{color:"#1e3040",fontFamily:MONO,fontSize:9}}>{sub}</span>
            </div>
          ))}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} />
    </div>
  );

  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",fontFamily:SANS,color:"#e2e8f0",background:"#020508"}}>
      <VideoBackground />
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg,rgba(0,2,12,0.46) 0%,rgba(0,4,18,0.22) 50%,rgba(0,2,12,0.42) 100%)",pointerEvents:"none",zIndex:0}} />
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,200,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.014) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0}} />
      {FlipOverlay}

      <header style={{
        height:70,flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 30px",
        background:"linear-gradient(180deg, rgba(5,12,26,0.55) 0%, rgba(2,6,18,0.44) 100%)",
        backdropFilter:"blur(38px) saturate(160%)",WebkitBackdropFilter:"blur(38px) saturate(160%)",
        borderBottom:"1px solid rgba(0,212,255,0.15)",
        boxShadow:"0 1px 0 rgba(0,212,255,0.08),0 8px 40px rgba(0,0,0,0.6)",
        zIndex:50,position:"relative",
      }}>
        <div style={{position:"absolute",bottom:-1,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(0,212,255,0.55) 18%,rgba(0,212,255,0.55) 82%,transparent)`,pointerEvents:"none"}} />

        <div style={{display:"flex",alignItems:"center",gap:22}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:34,height:34,position:"relative"}}>
              <div style={{position:"absolute",inset:0,borderRadius:10,background:"rgba(0,212,255,0.12)",border:"1.5px solid rgba(0,212,255,0.55)",boxShadow:"0 0 22px rgba(0,212,255,0.32)"}} />
              <div style={{position:"absolute",inset:0,borderRadius:10,border:"1px solid rgba(0,212,255,0.9)",opacity:0.5,animation:"orbit-pulse 3s ease-in-out infinite"}} />
              <div style={{position:"absolute",inset:7,borderRadius:3,background:CYAN,boxShadow:`0 0 12px ${CYAN}`}} />
            </div>
            <div>
              <div style={{color:"#f0f8ff",fontFamily:MONO,fontSize:14,fontWeight:800,letterSpacing:"0.22em",lineHeight:1}}>{T.appName}</div>
              <div style={{color:"rgba(0,212,255,0.5)",fontFamily:MONO,fontSize:7.5,letterSpacing:"0.26em",marginTop:3}}>DRIFT DETECTION SYSTEM</div>
            </div>
          </div>

          <div style={{width:1,height:26,background:"linear-gradient(180deg,transparent,rgba(0,212,255,0.22),transparent)",flexShrink:0}} />

          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px 6px 6px",borderRadius:11,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
            {(["UPLOAD","CONFIGURE","ANALYZE","RESULTS"] as const).map((step,i)=>{
              const active=(i===1&&screen==="configure")||(i===2&&isProcessing)||(i===3&&isResults);
              const done=(i===1&&(isProcessing||isResults))||(i===2&&isResults);
              const stepColor=active?CYAN:done?"#60a5fa":"rgba(255,255,255,0.26)";
              return(
                <React.Fragment key={step}>
                  <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:7,background:active?"rgba(0,212,255,0.10)":"transparent",transition:"background 0.25s"}}>
                    <div style={{width:16,height:16,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:active?"rgba(0,212,255,0.2)":done?"rgba(96,165,250,0.14)":"rgba(255,255,255,0.05)",border:`1px solid ${stepColor}66`,boxShadow:active?`0 0 10px rgba(0,212,255,0.4)`:"none",flexShrink:0}}>
                      {done?<span style={{color:"#60a5fa",fontSize:8,fontWeight:800}}>✓</span>:<span style={{color:stepColor,fontFamily:MONO,fontSize:7,fontWeight:800}}>{i+1}</span>}
                    </div>
                    <span style={{color:stepColor,fontFamily:MONO,fontSize:9.5,letterSpacing:"0.09em",fontWeight:active||done?700:400}}>{step}</span>
                  </div>
                  {i<3&&<div style={{width:12,height:1,background:done?"rgba(96,165,250,0.4)":"rgba(255,255,255,0.1)",flexShrink:0}} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {file&&(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)"}}>
              <Layers size={10} style={{color:"rgba(255,255,255,0.35)"}} />
              <span style={{color:"rgba(255,255,255,0.40)",fontFamily:MONO,fontSize:9,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</span>
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <Clock size={10} style={{color:"rgba(0,212,255,0.5)"}} />
            <span style={{color:"rgba(255,255,255,0.55)",fontFamily:MONO,fontSize:10,letterSpacing:"0.06em"}}>{clockStr}</span>
            <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:8}}>UTC</span>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:isProcessing?"rgba(245,158,11,0.12)":"rgba(16,185,129,0.10)",border:`1px solid ${isProcessing?"rgba(245,158,11,0.3)":"rgba(16,185,129,0.28)"}`,backdropFilter:"blur(12px)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:isProcessing?"#f59e0b":"#10b981",boxShadow:`0 0 8px ${isProcessing?"#f59e0b":"#10b981"}`,animation:"breathe 1.4s ease-in-out infinite"}} />
            <span style={{color:isProcessing?"#fbbf24":"#34d399",fontFamily:MONO,fontSize:9.5,letterSpacing:"0.12em",fontWeight:600}}>{isProcessing?T.analyzing:T.ready}</span>
          </div>

          <div style={{width:1,height:22,background:"rgba(255,255,255,0.1)",flexShrink:0}} />

          <LangPicker lang={lang} onChange={setLang} light />

          <button onClick={()=>{setScreen("upload");setFile(null);setImgUrl("");setResult(null);setHistory([]);setHImgs({});setShowSugg(false);setPhase("full");}}
            style={{display:"flex",alignItems:"center",gap:6,border:"1px solid rgba(255,255,255,0.14)",color:"rgba(255,255,255,0.55)",background:"rgba(255,255,255,0.06)",fontFamily:MONO,fontSize:9.5,padding:"6px 14px",borderRadius:8,cursor:"pointer",letterSpacing:"0.1em",backdropFilter:"blur(12px)",transition:"all 0.18s"}}>
            <RefreshCw size={10} />
            {T.newSession}
          </button>
        </div>
      </header>

      <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative",zIndex:1}}>
        <aside style={{width:296,flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto",background:"linear-gradient(180deg, rgba(4,10,24,0.46) 0%, rgba(2,6,18,0.40) 100%)",backdropFilter:"blur(34px) saturate(160%)",WebkitBackdropFilter:"blur(34px) saturate(160%)",borderRight:"1px solid rgba(0,212,255,0.10)",boxShadow:"1px 0 0 rgba(0,212,255,0.06),8px 0 40px rgba(0,0,0,0.5)"}}>
          {file&&(
            <div style={{padding:14,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,letterSpacing:"0.2em",marginBottom:10}}>{T.inputImage}</div>
              <div style={{borderRadius:10,overflow:"hidden",marginBottom:10,height:90,border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
                <img src={imageUrl} alt="Input" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.9) contrast(1.05)",display:"block"}} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[{l:"W",v:`${imgDims.w}px`},{l:"H",v:`${imgDims.h}px`},{l:"SIZE",v:`${(file.size/1024).toFixed(0)} KB`},{l:"FMT",v:(file.type.split("/")[1]||"IMG").toUpperCase()}].map(({l,v})=>(
                  <div key={l} style={{...glassW(0.06,10),borderRadius:7,padding:"6px 9px"}}>
                    <div style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:8,marginBottom:2}}>{l}</div>
                    <div style={{color:"rgba(255,255,255,0.75)",fontFamily:MONO,fontSize:11,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showSugg&&suggestion&&(
            <div className="suggestion" style={{margin:"12px 12px 0",padding:"12px 14px",borderRadius:12,...glassW(0.06,12),border:"1px solid rgba(16,185,129,0.3)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Sparkles size={11} style={{color:"#34d399"}} />
                  <span style={{color:"#34d399",fontFamily:MONO,fontSize:9,letterSpacing:"0.16em",fontWeight:700}}>{T.aiSuggests}</span>
                </div>
                <button onClick={()=>setShowSugg(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
              </div>
              <p style={{color:"rgba(255,255,255,0.5)",fontFamily:MONO,fontSize:9,lineHeight:1.6,marginBottom:7}}>{suggestion.reason}</p>
              {suggestion.details.map((d,i)=><div key={i} style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,lineHeight:1.6}}>› {d}</div>)}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,margin:"10px 0"}}>
                {[{l:"PATCH",v:`${suggestion.patchSize}px`},{l:"RADIUS",v:`${suggestion.searchRadius}nm`},{l:"THRESH",v:suggestion.threshold.toFixed(2)}].map(({l,v})=>(
                  <div key={l} style={{background:"rgba(52,211,153,0.1)",borderRadius:7,padding:"6px 4px",textAlign:"center",border:"1px solid rgba(52,211,153,0.15)"}}>
                    <div style={{color:"rgba(52,211,153,0.6)",fontFamily:MONO,fontSize:7,marginBottom:2}}>{l}</div>
                    <div style={{color:"#34d399",fontFamily:MONO,fontSize:12,fontWeight:700}}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setParams({patchSize:suggestion!.patchSize,searchRadius:suggestion!.searchRadius,threshold:suggestion!.threshold,method:suggestion!.method});setShowSugg(false);}} style={{width:"100%",padding:"8px 0",borderRadius:7,background:"rgba(52,211,153,0.14)",border:"1px solid rgba(52,211,153,0.35)",color:"#34d399",fontFamily:MONO,fontSize:10,cursor:"pointer",letterSpacing:"0.12em",backdropFilter:"blur(6px)"}}>{T.applyBtn}</button>
            </div>
          )}

          <div style={{margin:"12px 12px 0",padding:"12px 13px",borderRadius:12,...glassW(0.05,14),border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8,letterSpacing:"0.2em",marginBottom:10}}>SYSTEM HEALTH</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[
                {l:"GPU TEMP",v:68,max:100,c:"#10b981",unit:"°C"},
                {l:"VRAM ALLOC",v:2.1,max:8,c:"#3b82f6",unit:"GB"},
                {l:"CPU LOAD",v:24,max:100,c:"#f59e0b",unit:"%"},
                {l:"INFERENCE",v:isProcessing?92:8,max:100,c:isProcessing?"#f59e0b":"#10b981",unit:"%"},
              ].map(({l,v,max,c,unit})=>{
                const pct=(v/max)*100;
                return(
                  <div key={l}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8}}>{l}</span>
                      <span style={{color:c,fontFamily:MONO,fontSize:8,fontWeight:700}}>{v}{unit}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:c,boxShadow:`0 0 6px ${c}55`,transition:"width 0.6s"}} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#10b981",animation:"breathe 1s infinite"}} />
                <span style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8}}>ALL SYSTEMS NOMINAL</span>
              </div>
              <span style={{color:"rgba(255,255,255,0.2)",fontFamily:MONO,fontSize:7}}>v2.4.1</span>
            </div>
          </div>

          <div style={{margin:"10px 12px 0",padding:"12px 13px",borderRadius:12,...glassW(0.05,14),border:"1px solid rgba(0,212,255,0.14)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8,letterSpacing:"0.2em"}}>ORBITAL TELEMETRY</span>
              <div style={{width:14,height:14,borderRadius:"50%",border:"1.5px solid rgba(0,212,255,0.4)",position:"relative",flexShrink:0}}>
                <div style={{position:"absolute",inset:0,animation:"orbit-spin-cw 3s linear infinite"}}>
                  <div style={{position:"absolute",top:-1.5,left:"50%",width:3,height:3,marginLeft:-1.5,borderRadius:"50%",background:CYAN,boxShadow:`0 0 5px ${CYAN}`}} />
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              {[
                {l:"RING ANGLE",v:`${orbitAngle}°`,c:CYAN},
                {l:"ALTITUDE",v:`${orbitAlt.toFixed(1)}km`,c:"#a78bfa"},
                {l:"VELOCITY",v:`${orbitVel.toFixed(2)}km/s`,c:"#34d399"},
                {l:"UTC TIME",v:clockStr,c:"#fb923c"},
              ].map(({l,v,c})=>(
                <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:7,padding:"6px 8px"}}>
                  <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:7,marginBottom:2}}>{l}</div>
                  <div style={{color:c,fontFamily:MONO,fontSize:11,fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7,letterSpacing:"0.1em"}}>SESSION</span>
              <span style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:8,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sessionId}</span>
            </div>
          </div>

          {history.length>0&&(
            <div style={{margin:"10px 12px 0",padding:"12px 13px",borderRadius:12,...glassW(0.05,14),border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8,letterSpacing:"0.2em",marginBottom:10}}>SESSION STATS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  {l:"TOTAL RUNS",v:`${history.length}`,c:"#a78bfa"},
                  {l:"SUCCESS",v:`${history.filter(r=>r.success).length}/${history.length}`,c:"#34d399"},
                  {l:"AVG CONF",v:`${(history.reduce((a,r)=>a+r.confidence,0)/history.length).toFixed(1)}%`,c:CYAN},
                  {l:"AVG TIME",v:`${(history.reduce((a,r)=>a+r.processingTime,0)/history.length).toFixed(2)}s`,c:"#f59e0b"},
                ].map(({l,v,c})=>(
                  <div key={l} style={{...glassW(0.06,8),borderRadius:8,padding:"8px 9px"}}>
                    <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:7,marginBottom:3}}>{l}</div>
                    <div style={{color:c,fontFamily:MONO,fontSize:13,fontWeight:700}}>{v}</div>
                  </div>
                ))}
              </div>
              {history.length>1&&(
                <div style={{marginTop:10}}>
                  <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,marginBottom:5}}>CONFIDENCE TREND</div>
                  <MiniSparkline values={[...history].reverse().map(r=>r.confidence)} color={CYAN} w={228} h={32} />
                </div>
              )}
            </div>
          )}

          <div style={{flex:1,padding:14,display:"flex",flexDirection:"column",gap:20,marginTop:10}}>
            <div style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:9,letterSpacing:"0.2em"}}>{T.algoParams}</div>
            <div>
              <div style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,letterSpacing:"0.14em",marginBottom:8}}>{T.matchingMethod}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {(["NCC","Feature-Based","Hybrid AI"] as Method[]).map(m=>(
                  <button key={m} disabled={isProcessing} onClick={()=>!isProcessing&&setParams(p=>({...p,method:m}))}
                    style={{textAlign:"left",padding:"10px 13px",borderRadius:9,cursor:isProcessing?"not-allowed":"pointer",...(params.method===m?{background:"rgba(0,212,255,0.14)",border:"1px solid rgba(0,212,255,0.4)",color:CYAN,boxShadow:"0 0 18px rgba(0,212,255,0.12)"}:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.45)"}),fontFamily:MONO,fontSize:11,transition:"all 0.18s",backdropFilter:"blur(8px)"}}>
                    <span style={{visibility:params.method===m?"visible":"hidden",marginRight:7,fontSize:9}}>▶</span>{m}
                  </button>
                ))}
              </div>
            </div>
            {([
              {key:"patchSize" as const,label:T.patchSize,unit:"px",min:16,max:128,step:8,hint:"Template dimensions"},
              {key:"searchRadius" as const,label:T.searchRadius,unit:"nm",min:10,max:200,step:5,hint:"Scan window"},
              {key:"threshold" as const,label:T.corrThreshold,unit:"",min:0.4,max:0.99,step:0.01,hint:"Min confidence"},
            ]).map(({key,label,unit,min,max,step,hint})=>{
              const val=params[key] as number,pct=((val-min)/(max-min))*100,isActive=activeSlider===key;
              return(
                <div key={key} style={{...glassW(0.04,10),borderRadius:10,padding:"12px 12px 8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{color:"rgba(255,255,255,0.5)",fontFamily:MONO,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase"}}>{label}</span>
                    <span style={{color:isActive?"#ffffff":CYAN,fontFamily:MONO,fontSize:13,fontWeight:700}}>{key==="threshold"?val.toFixed(2):val}{unit}</span>
                  </div>
                  <div style={{position:"relative",height:22,display:"flex",alignItems:"center"}}>
                    <div style={{position:"absolute",left:0,right:0,height:4,borderRadius:2,background:"rgba(255,255,255,0.08)"}} />
                    <div style={{position:"absolute",left:0,width:`${pct}%`,height:4,borderRadius:2,background:`linear-gradient(90deg,#0ea5e9,${CYAN})`,boxShadow:isActive?"0 0 12px rgba(0,212,255,0.7)":"0 0 6px rgba(0,212,255,0.35)"}} />
                    <div style={{position:"absolute",left:`${pct}%`,transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:"#fff",border:`2px solid ${CYAN}`,boxShadow:isActive?`0 0 16px ${CYAN}`:` 0 0 8px rgba(0,212,255,0.4)`,pointerEvents:"none"}} />
                    {isActive&&<div style={{position:"absolute",left:`${pct}%`,bottom:24,transform:"translateX(-50%)",background:CYAN,color:"#000",fontFamily:MONO,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:5,whiteSpace:"nowrap",pointerEvents:"none",zIndex:10}}>{key==="threshold"?val.toFixed(2):val}{unit}</div>}
                    <input type="range" min={min} max={max} step={step} value={val} disabled={isProcessing}
                      onMouseDown={()=>setSlider(key)} onMouseUp={()=>setSlider(null)}
                      onChange={e=>setParams(p=>({...p,[key]:key==="threshold"?parseFloat(e.target.value):parseInt(e.target.value)}))}
                      style={{position:"absolute",left:0,right:0,width:"100%",opacity:0,height:22,cursor:isProcessing?"not-allowed":"pointer",margin:0}} />
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <span style={{color:"rgba(255,255,255,0.22)",fontFamily:MONO,fontSize:8}}>{min}{unit}</span>
                    <span style={{color:"rgba(255,255,255,0.28)",fontFamily:SANS,fontSize:9}}>{hint}</span>
                    <span style={{color:"rgba(255,255,255,0.22)",fontFamily:MONO,fontSize:8}}>{max}{unit}</span>
                  </div>
                </div>
              );
            })}

            {isResults&&resultPhase==="full"&&result?.success&&(
              <div style={{...glassW(0.06,14),borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:7}}>
                  <Settings2 size={10} style={{color:"rgba(255,255,255,0.4)"}} />
                  <span style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,letterSpacing:"0.16em"}}>{T.displayOpts}</span>
                </div>
                {[
                  {label:T.heatmapLbl,icon:showHeat?<Eye size={10}/>:<EyeOff size={10}/>,active:showHeat,color:CYAN,toggle:()=>setHeat(h=>!h)},
                  {label:corrected?T.correctedLbl:T.preCorrLbl,icon:<Move size={10}/>,active:corrected,color:"#34d399",toggle:()=>setCorr(c=>!c)},
                ].map(({label,icon,active,color,toggle})=>(
                  <button key={label} onClick={toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"10px 12px",cursor:"pointer",background:active?"rgba(255,255,255,0.05)":"transparent",border:"none",color:active?color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:10,letterSpacing:"0.06em",transition:"background 0.18s"}}>
                    <span style={{display:"flex",alignItems:"center",gap:7}}>{icon}{label}</span>
                    <div style={{width:28,height:15,borderRadius:8,display:"flex",alignItems:"center",padding:"0 2px",background:active?color:"rgba(255,255,255,0.1)",transition:"background 0.2s",flexShrink:0}}>
                      <div style={{width:11,height:11,borderRadius:"50%",background:"white",marginLeft:active?"auto":0,transition:"margin 0.22s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{padding:14,borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={runAnalysis} disabled={isProcessing||!file}
              className={(!isProcessing&&file)?"btn-idle":""}
              style={{width:"100%",padding:"14px 0",borderRadius:12,cursor:(isProcessing||!file)?"not-allowed":"pointer",background:isProcessing?"rgba(0,212,255,0.04)":"linear-gradient(135deg,rgba(0,150,255,0.22),rgba(59,130,246,0.2),rgba(0,180,255,0.18))",border:`1px solid ${isProcessing?"rgba(255,255,255,0.1)":CYAN}`,color:isProcessing?"rgba(255,255,255,0.25)":CYAN,fontFamily:MONO,fontSize:12,fontWeight:700,letterSpacing:"0.18em",display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"all 0.2s",backdropFilter:"blur(12px)",boxShadow:(!isProcessing&&file)?"0 0 24px rgba(0,212,255,0.18)":"none"}}>
              {isProcessing?<><div style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(0,212,255,0.25)",borderTopColor:CYAN,animation:"spin-cw 0.8s linear infinite"}} />{T.analyzing}…</>:<><Play size={14} fill={CYAN} />{T.runAnalysis}</>}
            </button>
            {isResults&&resultPhase==="full"&&<button onClick={runAnalysis} style={{width:"100%",padding:"9px 0",borderRadius:8,cursor:"pointer",...glassW(0.05,8),color:"rgba(255,255,255,0.5)",fontFamily:MONO,fontSize:10,letterSpacing:"0.1em",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><RefreshCw size={10} />{T.reRun}</button>}
          </div>
        </aside>

        <main ref={mainScrollRef} style={{flex:1,overflowY:"auto",position:"relative"}}>

          <section style={{height:"calc(100vh - 70px)",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",backgroundImage:"linear-gradient(rgba(0,212,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.018) 1px,transparent 1px)",backgroundSize:"44px 44px"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:1,background:"linear-gradient(180deg,transparent,rgba(255,255,255,0.1),transparent)",pointerEvents:"none"}} />
            <div style={{position:"absolute",right:0,top:0,bottom:0,width:1,background:"linear-gradient(180deg,transparent,rgba(255,255,255,0.1),transparent)",pointerEvents:"none"}} />
            <div style={{position:"absolute",top:14,right:16,zIndex:20,display:"flex",gap:6,alignItems:"center"}}>
              {[{icon:<ZoomIn size={12}/>,fn:()=>setZoom(z=>Math.min(7,z*1.25))},{icon:<ZoomOut size={12}/>,fn:()=>setZoom(z=>Math.max(0.4,z/1.25))},{icon:<RotateCcw size={12}/>,fn:()=>{setZoom(1);setPan({x:0,y:0});}}].map((b,i)=>(
                <button key={i} onClick={b.fn} style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",...glassW(0.08,12),color:"rgba(255,255,255,0.6)",cursor:"pointer"}}>{b.icon}</button>
              ))}
              <div style={{padding:"4px 10px",borderRadius:7,...glassW(0.07,10),color:"rgba(255,255,255,0.65)",fontFamily:MONO,fontSize:10}}>{Math.round(zoom*100)}%</div>
            </div>
            <div style={{overflow:"hidden",cursor:panning?"grabbing":"grab",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}
              onWheel={onWheel} onMouseDown={onMDown} onMouseMove={onMMove} onMouseUp={onMUp} onMouseLeave={onMUp}>
              {imageUrl?(
                <div style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,transformOrigin:"center",transition:panning?"none":"transform 0.04s ease",position:"relative",display:"inline-block"}}>
                  <img ref={imageRef} src={imageUrl} alt="SEM wafer" draggable={false}
                    style={{maxWidth:"calc(100vw - 320px)",maxHeight:"calc(100vh - 70px - 20px)",display:"block",objectFit:"contain",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,filter:isProcessing?"brightness(0.35) contrast(1.2)":resultPhase!=="full"&&isResults?"brightness(0.3) contrast(1.2)":"brightness(0.9) contrast(1.06)",transition:"filter 0.4s",boxShadow:isResults&&resultPhase==="full"?"0 0 60px rgba(0,0,0,0.5)":"0 0 30px rgba(0,0,0,0.35)"}} />
                  {isResults&&resultPhase==="full"&&<canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",borderRadius:8}} />}
                </div>
              ):(
                <div style={{textAlign:"center"}}>
                  <Layers size={36} style={{margin:"0 auto 12px",opacity:0.15,color:"rgba(255,255,255,0.6)"}} />
                  <p style={{fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.25)"}}>No image loaded</p>
                </div>
              )}
            </div>

            {isProcessing&&<ProcessingOverlay stages={T.stages} stageIdx={stageIdx} progress={progress} elapsed={elapsed} />}
            {isResults&&resultPhase==="score"&&result&&<ResultScoreReveal result={result} onDone={toFull} T={T} />}

            {!isProcessing&&resultPhase==="full"&&imageUrl&&(
              <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:0.28,pointerEvents:"none",animation:"bounce-arr 1.8s ease-in-out infinite"}}>
                <span style={{color:CYAN,fontFamily:MONO,fontSize:9,letterSpacing:"0.1em"}}>{isResults?T.scrollResults:T.scrollGuide}</span>
                <ChevronDown size={14} style={{color:CYAN}} />
              </div>
            )}
          </section>

          {isResults&&resultPhase==="full"&&result&&(
            <section ref={resultsRef} className="results-in" style={{padding:"32px 28px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                    <div style={{width:3,height:28,borderRadius:2,background:`linear-gradient(180deg,${CYAN},rgba(0,212,255,0.2))`}} />
                    <h2 style={{fontFamily:MONO,fontSize:16,fontWeight:700,letterSpacing:"0.15em",color:"rgba(255,255,255,0.9)"}}>{T.analysisResults}</h2>
                    <span className={badgeAnim} style={{fontFamily:MONO,fontSize:9,padding:"4px 11px",borderRadius:6,background:`rgba(${confRgb(result.confidence)},0.12)`,border:`1px solid rgba(${confRgb(result.confidence)},0.4)`,color:confColor(result.confidence),letterSpacing:"0.12em",fontWeight:700,boxShadow:`0 0 20px rgba(${confRgb(result.confidence)},0.15)`}}>
                      {result.success?T.matchFound:T.noMatch}
                    </span>
                  </div>
                  <p style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:10,marginLeft:15}}>Run #{result.id} · {result.params.method} · {hms(result.timestamp)} · {result.imgW}×{result.imgH}px</p>
                </div>
                <button onClick={runAnalysis} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,...glassW(0.08,14),border:`1px solid ${CYAN}`,color:CYAN,fontFamily:MONO,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.14em",boxShadow:`0 0 24px rgba(0,212,255,0.15)`}}><RefreshCw size={12} />{T.reRun}</button>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:9,marginBottom:18}}>
                {[
                  {label:"CONFIDENCE",value:`${result.confidence.toFixed(1)}%`,color:confColor(result.confidence),sub:result.confidence>=85?"High accuracy":result.confidence>=60?"Moderate":"Low — re-tune"},
                  {label:"DRIFT X",value:`${result.driftX>0?"+":""}${result.driftX.toFixed(1)}`,color:"#60a5fa",sub:"nanometres"},
                  {label:"DRIFT Y",value:`${result.driftY>0?"+":""}${result.driftY.toFixed(1)}`,color:"#a78bfa",sub:"nanometres"},
                  {label:"MAGNITUDE",value:`${driftMag(result).toFixed(1)}nm`,color:"#f59e0b",sub:`∠${(Math.atan2(result.driftY,result.driftX)*180/Math.PI).toFixed(0)}°`},
                  {label:"PROC. TIME",value:`${result.processingTime.toFixed(2)}s`,color:CYAN,sub:result.params.method},
                  {label:"PATCH SIZE",value:`${result.params.patchSize}px`,color:"#34d399",sub:`Radius ${result.params.searchRadius}nm`},
                  {label:"THRESHOLD",value:result.params.threshold.toFixed(2),color:"#fb923c",sub:result.success?"Passed ✓":"Failed ✗"},
                ].map(({label,value,color,sub})=>(
                  <div key={label} className="metric-card" style={{...glassW(0.07,18),padding:"13px 12px",borderRadius:13,border:`1px solid rgba(255,255,255,0.09)`,position:"relative",overflow:"hidden",boxShadow:`0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)`}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color},transparent)`,borderRadius:"13px 13px 0 0"}} />
                    <div style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:7,letterSpacing:"0.15em",marginBottom:6}}>{label}</div>
                    <div style={{color,fontFamily:MONO,fontSize:18,fontWeight:800,lineHeight:1,textShadow:`0 0 18px ${color}55`}}>{value}</div>
                    <div style={{color:"rgba(255,255,255,0.28)",fontFamily:MONO,fontSize:8,marginTop:5,lineHeight:1.4}}>{sub}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"160px 1fr 1fr",gap:14,marginBottom:18}}>
                <div className="metric-card" style={{...glassW(0.07,18),borderRadius:14,padding:"16px 14px",border:"1px solid rgba(255,255,255,0.09)",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em"}}>DRIFT DIRECTION</div>
                  <DriftCompass driftX={result.driftX} driftY={result.driftY} maxR={params.searchRadius} />
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#f59e0b",fontFamily:MONO,fontSize:11,fontWeight:700}}>{driftMag(result).toFixed(1)} nm</div>
                    <div style={{color:"rgba(255,255,255,0.28)",fontFamily:MONO,fontSize:8,marginTop:2}}>
                      {result.driftX>0?"→":"←"} {Math.abs(result.driftX).toFixed(1)} · {result.driftY>0?"↓":"↑"} {Math.abs(result.driftY).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="metric-card" style={{...glassW(0.07,18),borderRadius:14,padding:"16px 18px",border:"1px solid rgba(255,255,255,0.09)"}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:14}}>SIGNAL QUALITY GAUGES</div>
                  <div style={{display:"flex",gap:16,justifyContent:"center"}}>
                    <GaugeRing value={result.imgComplexity*100} color="#e879f9" label="COMPLEXITY" size={80} />
                    <GaugeRing value={result.featureDensity*100} color="#38bdf8" label="FEATURES" size={80} />
                    <GaugeRing value={(1-result.noiseLevel)*100} color="#34d399" label="CLEAN" size={80} />
                    <GaugeRing value={result.confidence} color={confColor(result.confidence)} label="CONF" size={80} />
                  </div>
                  <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {l:"Edge Sharpness",v:((1-result.noiseLevel)*0.7+result.featureDensity*0.3)*100,c:"#38bdf8"},
                      {l:"Pattern Entropy",v:(result.imgComplexity*0.65+result.featureDensity*0.35)*100,c:"#e879f9"},
                      {l:"SNR Estimate",v:((1-result.noiseLevel)*100),c:"#34d399"},
                      {l:"Texture Richness",v:(result.imgComplexity*100),c:"#fb923c"},
                    ].map(({l,v,c})=>(
                      <div key={l}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8}}>{l}</span>
                          <span style={{color:c,fontFamily:MONO,fontSize:8,fontWeight:700}}>{v.toFixed(0)}%</span>
                        </div>
                        <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.05)"}}>
                          <div style={{height:"100%",width:`${v}%`,borderRadius:2,background:c,opacity:0.8}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="metric-card" style={{...glassW(0.07,18),borderRadius:14,padding:"16px 18px",border:"1px solid rgba(255,255,255,0.09)"}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:14}}>ALGORITHM PERFORMANCE</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {([
                      {m:"NCC" as Method,color:"#3b82f6"},
                      {m:"Feature-Based" as Method,color:"#8b5cf6"},
                      {m:"Hybrid AI" as Method,color:CYAN},
                    ]).map(({m,color})=>{
                      const isActive=result.params.method===m;
                      const estConf=m==="NCC"
                        ?(48+(1-result.imgComplexity)*32+(1-result.noiseLevel)*14)
                        :m==="Feature-Based"
                        ?(58+result.featureDensity*24+(1-result.noiseLevel)*7)
                        :(70+result.imgComplexity*11+result.featureDensity*9);
                      const capped=Math.max(9,Math.min(99,estConf));
                      return(
                        <div key={m} style={{padding:"10px 12px",borderRadius:10,background:isActive?`${color}14`:"rgba(255,255,255,0.03)",border:`1px solid ${isActive?color+"55":"rgba(255,255,255,0.07)"}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <span style={{color:isActive?color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,fontWeight:isActive?700:400}}>{m}{isActive?" ← ACTIVE":""}</span>
                            <span style={{color:isActive?color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,fontWeight:700}}>{capped.toFixed(0)}%</span>
                          </div>
                          <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
                            <div style={{height:"100%",width:`${capped}%`,borderRadius:2,background:color,opacity:isActive?1:0.4}} />
                          </div>
                          <div style={{marginTop:5,display:"flex",gap:8}}>
                            {m==="NCC"&&<span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7}}>Speed: ●●●●● · Accuracy: ●●○○○</span>}
                            {m==="Feature-Based"&&<span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7}}>Speed: ●●●○○ · Accuracy: ●●●○○</span>}
                            {m==="Hybrid AI"&&<span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7}}>Speed: ●○○○○ · Accuracy: ●●●●●</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:18,marginBottom:18}}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:9,letterSpacing:"0.16em"}}>{T.detectedRegion}</div>
                  <div style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
                    <div style={{position:"relative"}}>
                      <img src={imageUrl} alt="Annotated" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block",filter:"brightness(0.85) contrast(1.08)"}} />
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.2)"}} />
                      {result.success&&(
                        <>
                          <div style={{position:"absolute",left:`${result.bbox.x*100}%`,top:`${result.bbox.y*100}%`,width:`${result.bbox.w*100}%`,height:`${result.bbox.h*100}%`,border:`2px solid ${confColor(result.confidence)}`,boxShadow:`0 0 18px ${confColor(result.confidence)}`,borderRadius:2,animation:"breathe-scale 2s ease-in-out infinite"}} />
                          <div style={{position:"absolute",left:`${result.bbox.x*100}%`,top:`calc(${result.bbox.y*100}% - 20px)`,background:"rgba(10,16,32,0.9)",border:`1px solid rgba(${confRgb(result.confidence)},0.55)`,borderRadius:4,padding:"2px 7px",backdropFilter:"blur(6px)"}}>
                            <span style={{color:confColor(result.confidence),fontFamily:MONO,fontSize:9,fontWeight:700}}>{result.confidence.toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                      <div style={{position:"absolute",bottom:6,left:6,...glassW(0.2,10),borderRadius:5,padding:"3px 7px"}}>
                        <span style={{color:"rgba(255,255,255,0.7)",fontFamily:MONO,fontSize:8}}>{result.imgW}×{result.imgH}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>setHeat(h=>!h)} style={{flex:1,padding:"8px 0",borderRadius:7,...glassW(showHeat?0.1:0.05,10),border:`1px solid ${showHeat?"rgba(0,200,255,0.35)":"rgba(255,255,255,0.1)"}`,color:showHeat?CYAN:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,cursor:"pointer",transition:"all 0.2s"}}>{showHeat?T.heatmapOn:T.heatmapOff}</button>
                    <button onClick={()=>setCorr(c=>!c)} style={{flex:1,padding:"8px 0",borderRadius:7,...glassW(corrected?0.1:0.05,10),border:`1px solid ${corrected?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.1)"}`,color:corrected?"#34d399":"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,cursor:"pointer",transition:"all 0.2s"}}>{corrected?T.correctedBtn:T.preCorrBtn}</button>
                  </div>

                  <div style={{...glassW(0.06,16),borderRadius:12,padding:"14px 14px",border:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:12}}>IMAGE FINGERPRINT</div>
                    {[
                      {l:"Complexity",v:result.imgComplexity,c:"#e879f9"},
                      {l:"Feature density",v:result.featureDensity,c:"#38bdf8"},
                      {l:"Noise level",v:result.noiseLevel,c:"#fb923c"},
                    ].map(({l,v,c})=>(
                      <div key={l} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{color:"rgba(255,255,255,0.5)",fontFamily:MONO,fontSize:8}}>{l}</span>
                          <span style={{color:c,fontFamily:MONO,fontSize:9,fontWeight:700}}>{(v*100).toFixed(0)}%</span>
                        </div>
                        <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${v*100}%`,borderRadius:2,background:`linear-gradient(90deg,${c}77,${c})`,boxShadow:`0 0 8px ${c}55`,transition:"width 1s ease-out"}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {!result.success&&(
                    <div className="metric-card" style={{...glassW(0.06,14),padding:"16px 18px",borderRadius:14,border:"1px solid rgba(239,68,68,0.3)",boxShadow:"0 0 30px rgba(239,68,68,0.08)"}}>
                      <div style={{display:"flex",gap:12}}>
                        <AlertCircle size={16} style={{color:"#f87171",flexShrink:0,marginTop:1}} />
                        <div>
                          <p style={{color:"#f87171",fontFamily:MONO,fontSize:11,fontWeight:700,marginBottom:5}}>{T.noReliableMatch}</p>
                          <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,lineHeight:1.65}}>{T.lowerThresholdHint}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="metric-card" style={{...glassW(0.08,20),padding:"20px 22px",borderRadius:16,border:`1px solid rgba(${confRgb(result.confidence)},0.3)`,boxShadow:`0 0 40px rgba(${confRgb(result.confidence)},0.08),inset 0 1px 0 rgba(255,255,255,0.09)`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <div style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,letterSpacing:"0.22em",marginBottom:4}}>{T.confidenceScore}</div>
                        <div style={{color:confColor(result.confidence),fontFamily:MONO,fontSize:56,fontWeight:800,lineHeight:1,letterSpacing:"-0.03em",textShadow:`0 0 40px rgba(${confRgb(result.confidence)},0.5)`}}>
                          {animConf.toFixed(1)}<span style={{fontSize:22,fontWeight:400,opacity:0.65}}>%</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{display:"block",fontFamily:MONO,fontSize:10,padding:"5px 13px",borderRadius:7,background:`rgba(${confRgb(result.confidence)},0.18)`,color:confColor(result.confidence),fontWeight:700,letterSpacing:"0.08em",marginBottom:9}}>
                          {result.confidence>=85?T.highConf:result.confidence>=60?T.medConf:T.lowConf}
                        </span>
                        <div style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:9}}>Algorithm: {result.params.method}</div>
                      </div>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:12}}>
                      <div style={{height:"100%",borderRadius:3,width:`${animConf}%`,background:`linear-gradient(90deg,rgba(${confRgb(result.confidence)},0.5),${confColor(result.confidence)})`,boxShadow:`0 0 14px ${confColor(result.confidence)}`,transition:"width 0.08s"}} />
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {[{label:"LOW",range:"<60%",active:result.confidence<60,c:"#f87171"},{label:"MED",range:"60–85%",active:result.confidence>=60&&result.confidence<85,c:"#fbbf24"},{label:"HIGH",range:">85%",active:result.confidence>=85,c:"#34d399"}].map(({label,range,active,c})=>(
                        <div key={label} style={{padding:"7px 8px",borderRadius:8,...(active?{background:`rgba(${c==="rgb(248,113,113)"?"248,113,113":c==="#fbbf24"?"251,191,36":"52,211,153"},0.14)`,border:`1px solid ${c}55`}:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}),textAlign:"center"}}>
                          <div style={{color:active?c:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:9,fontWeight:active?700:400}}>{label}</div>
                          <div style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7,marginTop:2}}>{range}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.success&&(
                    <>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                        {[
                          {l:T.driftXLbl,v:animDX.toFixed(1),raw:result.driftX,c:"#60a5fa",icon:"→"},
                          {l:T.driftYLbl,v:animDY.toFixed(1),raw:result.driftY,c:"#a78bfa",icon:"↓"},
                          {l:T.magnitudeLbl,v:animMag.toFixed(1),raw:driftMag(result),c:"#fbbf24",icon:"◎"},
                        ].map(({l,v,raw,c,icon})=>(
                          <div key={l} className="metric-card" style={{...glassW(0.07,16),padding:"15px 14px",borderRadius:13,border:"1px solid rgba(255,255,255,0.1)",position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)"}}>
                            <div style={{position:"absolute",top:6,right:10,fontFamily:MONO,fontSize:20,color:"rgba(255,255,255,0.06)",fontWeight:800}}>{icon}</div>
                            <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:7}}>{l}</div>
                            <div style={{color:c,fontFamily:MONO,fontSize:24,fontWeight:800,lineHeight:1,textShadow:`0 0 16px ${c}55`}}>{l!==T.magnitudeLbl&&raw>0?"+":""}{v}</div>
                            <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:9,marginTop:5}}>nanometres</div>
                          </div>
                        ))}
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 110px 110px",gap:10}}>
                        <div className="metric-card" style={{...glassW(0.07,16),padding:"15px 16px",borderRadius:13,border:"1px solid rgba(52,211,153,0.25)"}}>
                          <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:7}}>{T.correctionVec}</div>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 10px #34d399",flexShrink:0}} />
                            <span style={{color:"#34d399",fontFamily:MONO,fontSize:15,fontWeight:700}}>
                              ({result.correctionX>0?"+":""}{result.correctionX.toFixed(1)}, {result.correctionY>0?"+":""}{result.correctionY.toFixed(1)}) nm
                            </span>
                          </div>
                          <div style={{marginTop:8,color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:9}}>Stage correction to re-align beam</div>
                        </div>
                        {[{l:"PROC. TIME",v:`${animTime.toFixed(2)}s`,c:CYAN},{l:"METHOD",v:result.params.method,c:"#a78bfa"}].map(({l,v,c})=>(
                          <div key={l} className="metric-card" style={{...glassW(0.07,16),padding:"15px 14px",borderRadius:13,border:"1px solid rgba(255,255,255,0.1)"}}>
                            <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,letterSpacing:"0.18em",marginBottom:7}}>{l}</div>
                            <div style={{color:c,fontFamily:MONO,fontSize:13,fontWeight:700,lineHeight:1.3}}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div className="metric-card" style={{...glassW(0.07,18),padding:"18px 20px",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)"}}>
                        <div style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,letterSpacing:"0.18em",marginBottom:16}}>DETECTION QUALITY BREAKDOWN</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                          {[
                            {l:T.imgComplexity,v:result.imgComplexity,d:"Texture richness of wafer pattern",c:"#e879f9"},
                            {l:T.featureDensity,v:result.featureDensity,d:"Keypoint density for feature matching",c:"#38bdf8"},
                            {l:T.noiseLevel,v:result.noiseLevel,d:"Estimated signal noise ratio",c:"#fb923c"},
                          ].map(({l,v,d,c})=>(
                            <div key={l}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                                <span style={{color:"rgba(255,255,255,0.5)",fontFamily:MONO,fontSize:8,letterSpacing:"0.1em"}}>{l}</span>
                                <span style={{color:c,fontFamily:MONO,fontSize:13,fontWeight:700}}>{(v*100).toFixed(0)}%</span>
                              </div>
                              <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:6}}>
                                <div style={{height:"100%",width:`${v*100}%`,borderRadius:3,background:`linear-gradient(90deg,${c}66,${c})`,boxShadow:`0 0 10px ${c}55`}} />
                              </div>
                              <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,lineHeight:1.5}}>{d}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {history.length>1&&(
                <div style={{...glassW(0.06,18),borderRadius:14,padding:"18px 20px",marginTop:18,border:"1px solid rgba(255,255,255,0.09)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <BarChart2 size={12} style={{color:"rgba(255,255,255,0.4)"}} />
                      <span style={{color:"rgba(255,255,255,0.45)",fontFamily:MONO,fontSize:9,letterSpacing:"0.2em"}}>RUN COMPARISON TABLE</span>
                    </div>
                    <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:9}}>{history.length} runs</span>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontFamily:MONO,fontSize:9}}>
                      <thead>
                        <tr>
                          {["RUN","METHOD","CONF %","DRIFT X","DRIFT Y","MAG","TIME","STATUS"].map(h=>(
                            <th key={h} style={{color:"rgba(255,255,255,0.28)",fontWeight:600,letterSpacing:"0.12em",padding:"5px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",textAlign:h==="RUN"?"center":"left",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(r=>{
                          const isCur=r.id===result.id;
                          const cc=confColor(r.confidence);
                          return(
                            <tr key={r.id} style={{background:isCur?"rgba(0,212,255,0.05)":"transparent",transition:"background 0.2s"}}>
                              <td style={{padding:"7px 10px",textAlign:"center",color:isCur?CYAN:"rgba(255,255,255,0.4)",fontWeight:isCur?700:400,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.id}</td>
                              <td style={{padding:"7px 10px",color:"rgba(255,255,255,0.5)",borderBottom:"1px solid rgba(255,255,255,0.04)",whiteSpace:"nowrap"}}>{r.params.method}</td>
                              <td style={{padding:"7px 10px",color:cc,fontWeight:700,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.confidence.toFixed(1)}</td>
                              <td style={{padding:"7px 10px",color:"#60a5fa",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.driftX>0?"+":""}{r.driftX.toFixed(1)}</td>
                              <td style={{padding:"7px 10px",color:"#a78bfa",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.driftY>0?"+":""}{r.driftY.toFixed(1)}</td>
                              <td style={{padding:"7px 10px",color:"#f59e0b",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{driftMag(r).toFixed(1)}</td>
                              <td style={{padding:"7px 10px",color:CYAN,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{r.processingTime.toFixed(2)}s</td>
                              <td style={{padding:"7px 10px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{color:r.success?"#34d399":"#f87171",fontWeight:600}}>{r.success?"✓":"✗"}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {history.length>2&&(
                    <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div>
                        <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,marginBottom:6}}>CONFIDENCE TREND</div>
                        <MiniSparkline values={[...history].reverse().map(r=>r.confidence)} color={CYAN} w={200} h={40} />
                      </div>
                      <div>
                        <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,marginBottom:6}}>DRIFT MAGNITUDE TREND</div>
                        <MiniSparkline values={[...history].reverse().map(r=>driftMag(r))} color="#f59e0b" w={200} h={40} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:16}}>
                <button onClick={()=>mainScrollRef.current?.scrollTo({top:0,behavior:"smooth"})} style={{padding:"10px 22px",borderRadius:9,...glassW(0.06,12),color:"rgba(255,255,255,0.55)",fontFamily:MONO,fontSize:11,cursor:"pointer",letterSpacing:"0.1em"}}>{T.backViewer}</button>
                <button onClick={runAnalysis} className="btn-idle" style={{padding:"12px 32px",borderRadius:11,...glassW(0.1,14),border:`1px solid ${CYAN}`,color:CYAN,fontFamily:MONO,fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.16em",display:"flex",alignItems:"center",gap:9,boxShadow:`0 0 28px rgba(0,212,255,0.18)`}}>
                  <Play size={13} fill={CYAN} />{T.runAgain}
                </button>
              </div>

              <div style={{marginTop:32,paddingTop:28,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <Sparkles size={13} style={{color:"rgba(255,255,255,0.45)"}} />
                  <span style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:10,letterSpacing:"0.22em"}}>ABOUT THIS PROJECT</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14}}>
                  <div style={{...glassW(0.07,20),borderRadius:16,padding:"22px 20px",border:"1px solid rgba(0,212,255,0.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:9,background:"rgba(0,212,255,0.15)",border:"1px solid rgba(0,212,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Activity size={14} style={{color:CYAN}} />
                      </div>
                      <span style={{color:"rgba(255,255,255,0.8)",fontFamily:MONO,fontSize:11,fontWeight:700}}>DRIFT-SENSE</span>
                    </div>
                    <p style={{color:"rgba(255,255,255,0.55)",fontFamily:SANS,fontSize:11,lineHeight:1.8,marginBottom:10}}>
                      A real-time semiconductor inspection system designed to detect and correct nanoscale beam drift in Scanning Electron Microscope (SEM) wafer imaging pipelines.
                    </p>
                    <p style={{color:"rgba(255,255,255,0.35)",fontFamily:SANS,fontSize:10,lineHeight:1.75}}>
                      Drift in SEM stages causes misregistration between reference and acquired frames — leading to critical defect misses in lithography and metrology. DRIFT-SENSE recovers the true drift vector in sub-4s, enabling closed-loop stage correction.
                    </p>
                  </div>

                  <div style={{...glassW(0.07,20),borderRadius:16,padding:"22px 20px",border:"1px solid rgba(167,139,250,0.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:9,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Cpu size={14} style={{color:"#a78bfa"}} />
                      </div>
                      <span style={{color:"rgba(255,255,255,0.8)",fontFamily:MONO,fontSize:11,fontWeight:700}}>TECH STACK</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[
                        {label:"Frontend",v:"React 18 + TypeScript + Recharts"},
                        {label:"Algorithms",v:"NCC · SIFT/ORB · CNN Attention"},
                        {label:"Precision",v:"±0.1nm sub-pixel drift resolution"},
                        {label:"Throughput",v:"< 4s per frame · supports 200+ fps"},
                        {label:"Languages",v:"English · हिन्दी · தமிழ் · Français"},
                      ].map(({label,v})=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                          <span style={{color:"rgba(255,255,255,0.38)",fontFamily:MONO,fontSize:8,letterSpacing:"0.1em"}}>{label}</span>
                          <span style={{color:"rgba(255,255,255,0.6)",fontFamily:MONO,fontSize:9}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{...glassW(0.07,20),borderRadius:16,padding:"22px 20px",border:"1px solid rgba(52,211,153,0.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:9,background:"rgba(52,211,153,0.14)",border:"1px solid rgba(52,211,153,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <BarChart2 size={14} style={{color:"#34d399"}} />
                      </div>
                      <span style={{color:"rgba(255,255,255,0.8)",fontFamily:MONO,fontSize:11,fontWeight:700}}>THIS RUN SUMMARY</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      <div style={{padding:"11px 13px",borderRadius:10,background:"rgba(52,211,153,0.09)",border:"1px solid rgba(52,211,153,0.2)"}}>
                        <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,marginBottom:4}}>STATUS</div>
                        <div style={{color:result.success?"#34d399":"#f87171",fontFamily:MONO,fontSize:13,fontWeight:700}}>{result.success?"✓ Match Located":"✗ No reliable match"}</div>
                      </div>
                      {result.success&&(
                        <div style={{padding:"11px 13px",borderRadius:10,background:"rgba(0,212,255,0.07)",border:"1px solid rgba(0,212,255,0.18)"}}>
                          <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,marginBottom:4}}>CORRECTION APPLIED</div>
                          <div style={{color:CYAN,fontFamily:MONO,fontSize:12,fontWeight:700}}>ΔX {result.correctionX>0?"+":""}{result.correctionX.toFixed(1)} · ΔY {result.correctionY>0?"+":""}{result.correctionY.toFixed(1)} nm</div>
                        </div>
                      )}
                      <div style={{padding:"11px 13px",borderRadius:10,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)"}}>
                        <div style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:8,marginBottom:4}}>SESSION RUNS</div>
                        <div style={{color:"#a78bfa",fontFamily:MONO,fontSize:13,fontWeight:700}}>{history.length} run{history.length!==1?"s":""} · {history.filter(r=>r.success).length} matched</div>
                      </div>
                    </div>
                  </div>

                  <div style={{...glassW(0.07,20),borderRadius:16,padding:"22px 20px",border:"1px solid rgba(251,146,60,0.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:9,background:"rgba(251,146,60,0.14)",border:"1px solid rgba(251,146,60,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <AlertCircle size={14} style={{color:"#fb923c"}} />
                      </div>
                      <span style={{color:"rgba(255,255,255,0.8)",fontFamily:MONO,fontSize:11,fontWeight:700}}>SPEC SHEET</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {[
                        {l:"Drift Range",v:"±200 nm"},
                        {l:"Sub-pixel",v:"0.1 nm"},
                        {l:"FOV",v:"10 µm × 10 µm"},
                        {l:"Wafer size",v:"200–300 mm"},
                        {l:"SEM kV",v:"1–30 kV"},
                        {l:"Frame rate",v:"1–200 fps"},
                        {l:"Latency",v:"< 4 s (Hybrid)"},
                        {l:"GPU",v:"RTX 3080+"},
                      ].map(({l,v})=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                          <span style={{color:"rgba(255,255,255,0.35)",fontFamily:MONO,fontSize:8,letterSpacing:"0.1em"}}>{l}</span>
                          <span style={{color:"#fb923c",fontFamily:MONO,fontSize:8,fontWeight:600}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(screen==="configure"||(isResults&&resultPhase==="full"))&&!isProcessing&&(
            <ModelGuide selected={params.method} onSelect={m=>setParams(p=>({...p,method:m}))} T={T} />
          )}

          {history.length>0&&resultPhase==="full"&&(
            <section style={{padding:"24px 28px 36px",borderTop:"1px solid rgba(255,255,255,0.07)",...glassW(0.04,10)}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <BarChart2 size={12} style={{color:"rgba(255,255,255,0.4)"}} />
                  <span style={{color:"rgba(255,255,255,0.4)",fontFamily:MONO,fontSize:10,letterSpacing:"0.2em"}}>{T.sessionHistory}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <span style={{color:CYAN,fontFamily:MONO,fontSize:10}}>{history.filter(r=>r.success).length}/{history.length} matched</span>
                  <span style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:10}}>{T.runLbl(history.length)}</span>
                </div>
              </div>

              {history.length>1&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
                  {[
                    {title:"CONFIDENCE OVER RUNS",values:([...history].reverse().map(r=>r.confidence)),color:CYAN},
                    {title:"DRIFT MAGNITUDE TREND",values:([...history].reverse().map(r=>driftMag(r))),color:"#f59e0b"},
                    {title:"PROCESSING TIME TREND",values:([...history].reverse().map(r=>r.processingTime)),color:"#a78bfa"},
                  ].map(({title,values,color})=>(
                    <div key={title} style={{...glassW(0.06,14),borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.08)"}}>
                      <div style={{color:"rgba(255,255,255,0.3)",fontFamily:MONO,fontSize:8,letterSpacing:"0.14em",marginBottom:8}}>{title}</div>
                      <MiniSparkline values={values} color={color} w={180} h={40} />
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                        <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:8}}>min {Math.min(...values).toFixed(1)}</span>
                        <span style={{color:color,fontFamily:MONO,fontSize:8,fontWeight:700}}>avg {(values.reduce((a,v)=>a+v,0)/values.length).toFixed(1)}</span>
                        <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:8}}>max {Math.max(...values).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(192px,1fr))",gap:10}}>
                {history.map(r=>{
                  const isCur=r.id===result?.id;
                  const cc=confColor(r.confidence);
                  const cr=confRgb(r.confidence);
                  return(
                    <div key={r.id} style={{...glassW(isCur?0.1:0.06,16),borderRadius:13,overflow:"hidden",border:`1px solid ${isCur?"rgba(0,212,255,0.3)":"rgba(255,255,255,0.08)"}`,animation:"float-y 3s ease-in-out infinite",animationDelay:`${(r.id%5)*0.4}s`,boxShadow:isCur?"0 0 24px rgba(0,212,255,0.12)":"none"}}>
                      {histImgs[r.id]&&(
                        <div style={{height:72,overflow:"hidden",position:"relative"}}>
                          <img src={histImgs[r.id]} alt="thumb" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.75) contrast(1.08)"}} />
                          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.5))`}} />
                          <div style={{position:"absolute",top:5,left:6,...glassW(0.25,6),borderRadius:4,padding:"2px 6px"}}>
                            <span style={{color:isCur?CYAN:"rgba(255,255,255,0.6)",fontFamily:MONO,fontSize:8,fontWeight:700}}>#{r.id}{isCur?" ●":""}</span>
                          </div>
                          <div style={{position:"absolute",top:5,right:6,...glassW(0.25,8),borderRadius:5,padding:"2px 6px",border:`1px solid rgba(${cr},0.45)`}}>
                            <span style={{color:cc,fontFamily:MONO,fontSize:9,fontWeight:700}}>{r.confidence.toFixed(1)}%</span>
                          </div>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${cc},transparent)`,opacity:0.6}} />
                        </div>
                      )}
                      <div style={{padding:"10px 11px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span style={{color:isCur?CYAN:"rgba(255,255,255,0.55)",fontFamily:MONO,fontSize:9,fontWeight:700}}>Run #{r.id}</span>
                          <span style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:8}}>{hms(r.timestamp)}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                          {[
                            {l:"METHOD",v:r.params.method==="Feature-Based"?"Feature":r.params.method,c:"rgba(255,255,255,0.5)"},
                            {l:"TIME",v:`${r.processingTime.toFixed(2)}s`,c:CYAN},
                            {l:"DRIFT",v:`${driftMag(r).toFixed(1)}nm`,c:"#f59e0b"},
                            {l:"PATCH",v:`${r.params.patchSize}px`,c:"#a78bfa"},
                          ].map(({l,v,c})=>(
                            <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:5,padding:"4px 6px"}}>
                              <div style={{color:"rgba(255,255,255,0.25)",fontFamily:MONO,fontSize:7,marginBottom:1}}>{l}</div>
                              <div style={{color:c,fontFamily:MONO,fontSize:9,fontWeight:600}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{color:r.success?"#34d399":"#f87171",fontFamily:MONO,fontSize:8,fontWeight:700}}>{r.success?"✓ MATCH":"✗ NO MATCH"}</span>
                          <div style={{display:"flex",gap:3}}>
                            {[r.params.method==="NCC",r.params.method==="Feature-Based",r.params.method==="Hybrid AI"].map((active,i)=>(
                              <div key={i} style={{width:6,height:6,borderRadius:1,background:active?["#3b82f6","#8b5cf6",CYAN][i]:"rgba(255,255,255,0.08)"}} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>

      <footer style={{
        height:32,flexShrink:0,zIndex:50,position:"relative",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 18px",fontFamily:MONO,fontSize:9,
        background:"linear-gradient(180deg, rgba(2,6,18,0.5) 0%, rgba(2,6,18,0.6) 100%)",
        backdropFilter:"blur(30px) saturate(150%)",WebkitBackdropFilter:"blur(30px) saturate(150%)",
        borderTop:"1px solid rgba(0,212,255,0.12)",
        color:"rgba(255,255,255,0.32)",
      }}>
        <div style={{position:"absolute",top:-1,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.4) 30%,rgba(0,212,255,0.4) 70%,transparent)",pointerEvents:"none"}} />

        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:isProcessing?"#f59e0b":"#10b981",boxShadow:`0 0 7px ${isProcessing?"#f59e0b":"#10b981"}`,animation:"breathe 1.6s ease-in-out infinite"}} />
            <span style={{color:isProcessing?"#fbbf24":"#34d399",fontWeight:700,letterSpacing:"0.14em"}}>{isProcessing?"ANALYZING":"LINK STABLE"}</span>
          </span>
          <span style={{width:1,height:11,background:"rgba(255,255,255,0.1)"}} />
          <span style={{letterSpacing:"0.05em"}}>ORBIT RING <span style={{color:"rgba(0,212,255,0.6)",fontWeight:600}}>{orbitAngle}°</span></span>
          <span style={{letterSpacing:"0.05em"}}>ALT <span style={{color:"rgba(0,212,255,0.6)",fontWeight:600}}>{orbitAlt.toFixed(1)}km</span></span>
          <span style={{letterSpacing:"0.05em"}}>SESSION <span style={{color:"rgba(255,255,255,0.45)",fontWeight:600}}>{sessionId}</span></span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{color:"rgba(255,255,255,0.4)",letterSpacing:"0.1em",fontWeight:600}}>{T.appName} <span style={{color:"rgba(255,255,255,0.24)",fontWeight:400}}>v2.4.1</span></span>
          <span style={{width:1,height:11,background:"rgba(255,255,255,0.1)"}} />
          <span style={{color:"rgba(0,212,255,0.6)",fontWeight:700,letterSpacing:"0.06em"}}>{clockStr} <span style={{color:"rgba(0,212,255,0.35)",fontWeight:400}}>UTC</span></span>
        </div>
      </footer>
    </div>
  );
}
