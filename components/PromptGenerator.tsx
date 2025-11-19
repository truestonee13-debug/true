import React, { useState, useCallback } from 'react';
import { generateVideoPrompt, generateColorToneRecommendation } from '../services/geminiService';
import { LANGUAGES, VISUAL_STYLES, HISTORICAL_ERAS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import HistoryPanel from './HistoryPanel';

type SceneCut = {
    cutNumber: string;
    description: string;
    narration: string;
    backgroundMusic: string;
    soundEffects: string;
    dynamicElements: string;
};

type Character = {
    name: string;
    description: string;
};

type GeneratedResult = {
    fullPrompt: string;
    characters: Character[];
    sceneCuts: SceneCut[];
};

type HistoryItem = {
    id: string;
    timestamp: number;
    verse: string;
    generatedResult: GeneratedResult;
    inputs: {
        verse: string;
        language: string;
        videoLength: string;
        cutLength: string;
        style: string;
        era: string;
        country: string;
        colorTone: string;
    };
};

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 .993.883L13 3v2.036a1 1 0 0 1-1.993.117L11 5.036V3a1 1 0 0 1 1-1zm0 14a1 1 0 0 1 .993.883L13 17v4a1 1 0 0 1-1.993.117L11 21v-4a1 1 0 0 1 1-1zm7.071-7.071a1 1 0 0 1 .093 1.32l-.093.094-1.45 1.45a1 1 0 0 1-1.497-1.32l.094-.093 1.45-1.45a1 1 0 0 1 1.4 0zm-12.728 0a1 1 0 0 1 .094 1.322l-.094.092-2.122 2.121a1 1 0 0 1-1.497-1.32l.094-.093L6.25 10.344a1 1 0 0 1 1.414 0zM4.929 6.343a1 1 0 0 1 1.497-1.32l-.094.093L4.21 7.237a1 1 0 0 1-1.32-1.497l.092-.094 2.122-2.121a1 1 0 0 1 1.414 0zM16.95 6.437a1 1 0 0 1 1.497 1.32l-.094.093-1.45 1.45a1 1 0 0 1-1.32-1.497l.093-.094 1.45-1.45a1 1 0 0 1 1.4 0zm-4.95-3.518a1 1 0 0 1 .993.883L13 3.896v2.023a1 1 0 0 1-1.993.117L11 5.919V3.896a1 1 0 0 1 1-1.08z"></path></svg>
);

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.34 2.06c.39-.39 1.02-.39 1.41 0l2.12 2.12c.39.39.39 1.02 0 1.41L4.22 16.24l-2.83.71.71-2.83L11.34 2.06zM13.46 8.54l-1.41-1.41-7.07 7.07 1.41 1.41 7.07-7.07zm6.71 11.29l-2.12-2.12c-.39-.39-1.02-.39-1.41 0L15.22 19.1l2.83-.71-.71 2.83 1.41-1.41c.4-.4.4-1.03 0-1.42zM21.5 13.34l-2.12-2.12c-.39-.39-1.02-.39-1.41 0l-1.06 1.06 2.12 2.12 1.06-1.06c.39-.39.39-1.02 0-1.41z"></path></svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7v2a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.25 2.52.75-1.23-3.5-2.07V8H12z"/>
    </svg>
);


const PromptGenerator: React.FC = () => {
    const [verse, setVerse] = useState('');
    const [language, setLanguage] = useState('Korean');
    const [videoLength, setVideoLength] = useState('');
    const [cutLength, setCutLength] = useState('');
    const [style, setStyle] = useState('Cinematic Realism');
    const [era, setEra] = useState('Filmmaker\'s Interpretation');
    const [country, setCountry] = useState('');
    const [colorTone, setColorTone] = useState('');
    const [isRecommendingTone, setIsRecommendingTone] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'full' | 'cuts'>('full');
    const [fullPromptCopySuccess, setFullPromptCopySuccess] = useState(false);
    const [copiedCutIndex, setCopiedCutIndex] = useState<number | null>(null);
    const [copiedCharacterIndex, setCopiedCharacterIndex] = useState<number | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    React.useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('promptHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            setHistory([]);
        }
    }, []);

    React.useEffect(() => {
        try {
            localStorage.setItem('promptHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);

    const handleGenerate = useCallback(async () => {
        if (!verse.trim()) {
            setError('성경 구절을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedResult(null);
        try {
            const result = await generateVideoPrompt(verse, language, videoLength, cutLength, style, era, country, colorTone);
            setGeneratedResult(result);
            setActiveTab('full');

            const newHistoryItem: HistoryItem = {
                id: new Date().toISOString(),
                timestamp: Date.now(),
                verse: verse,
                generatedResult: result,
                inputs: { verse, language, videoLength, cutLength, style, era, country, colorTone },
            };
            setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, 50));

        } catch (err) {
            setError('프롬프트 생성에 실패했습니다. 나중에 다시 시도해주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [verse, language, videoLength, cutLength, style, era, country, colorTone]);
    
    const handleRecommendTone = useCallback(async () => {
        if (!verse.trim()) {
            setError('색상톤을 추천받으려면 먼저 성경 구절을 입력해주세요.');
            return;
        }
        setIsRecommendingTone(true);
        setError(null);
        try {
            const recommendation = await generateColorToneRecommendation(verse);
            setColorTone(recommendation);
        } catch (err) {
            setError('색상톤 추천에 실패했습니다.');
            console.error(err);
        } finally {
            setIsRecommendingTone(false);
        }
    }, [verse]);

    const handleCopyFullPrompt = () => {
        if (generatedResult) {
            navigator.clipboard.writeText(generatedResult.fullPrompt);
            setFullPromptCopySuccess(true);
            setTimeout(() => setFullPromptCopySuccess(false), 2000);
        }
    };

    const handleCopyCut = (textToCopy: string, index: number) => {
        navigator.clipboard.writeText(textToCopy);
        setCopiedCutIndex(index);
        setTimeout(() => setCopiedCutIndex(null), 2000);
    };

    const handleCopyCharacter = (character: Character, index: number) => {
        const textToCopy = `${character.name}\n\n${character.description}`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedCharacterIndex(index);
        setTimeout(() => setCopiedCharacterIndex(null), 2000);
    };
    
    const handleFullPromptChange = (newValue: string) => {
        if (!generatedResult) return;

        setGeneratedResult({
            ...generatedResult,
            fullPrompt: newValue,
        });
    };

    const handleSceneCutChange = (
        field: keyof Omit<SceneCut, 'cutNumber' | 'description'>,
        newValue: string,
        index: number
    ) => {
        if (!generatedResult) return;

        const updatedSceneCuts = generatedResult.sceneCuts.map((cut, i) => {
            if (i === index) {
                return { ...cut, [field]: newValue };
            }
            return cut;
        });

        setGeneratedResult({
            ...generatedResult,
            sceneCuts: updatedSceneCuts,
        });
    };

    const handleCharacterChange = (
        field: keyof Character,
        newValue: string,
        index: number
    ) => {
        if (!generatedResult) return;

        const updatedCharacters = generatedResult.characters.map((char, i) => {
            if (i === index) {
                return { ...char, [field]: newValue };
            }
            return char;
        });

        setGeneratedResult({
            ...generatedResult,
            characters: updatedCharacters,
        });
    };

    const handleReset = useCallback(() => {
        setVerse('');
        setLanguage('Korean');
        setVideoLength('');
        setCutLength('');
        setStyle('Cinematic Realism');
        setEra('Filmmaker\'s Interpretation');
        setCountry('');
        setColorTone('');
        setIsRecommendingTone(false);
        setGeneratedResult(null);
        setIsLoading(false);
        setError(null);
        setActiveTab('full');
        setFullPromptCopySuccess(false);
        setCopiedCutIndex(null);
        setCopiedCharacterIndex(null);
    }, []);

    const handleLoadHistoryItem = useCallback((item: HistoryItem) => {
        setVerse(item.inputs.verse);
        setLanguage(item.inputs.language);
        setVideoLength(item.inputs.videoLength);
        setCutLength(item.inputs.cutLength);
        setStyle(item.inputs.style);
        setEra(item.inputs.era);
        setCountry(item.inputs.country);
        setColorTone(item.inputs.colorTone);
        setGeneratedResult(item.generatedResult);
        setActiveTab('full');
        setIsHistoryOpen(false);
        setError(null);
    }, []);

    const handleDeleteHistoryItem = useCallback((id: string) => {
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return (
        <div className="max-w-4xl mx-auto bg-gray-800/30 rounded-lg shadow-2xl p-6 md:p-8 backdrop-blur-lg border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="md:col-span-2">
                     <div className="flex justify-between items-center mb-2">
                        <label htmlFor="bible-verse" className="block text-sm font-medium text-cyan-300">
                           1. 성경 구절 입력
                        </label>
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center text-xs text-cyan-400 hover:text-cyan-200 transition-colors font-semibold"
                            title="출력기록 보기"
                        >
                            <HistoryIcon className="w-4 h-4 mr-1.5" />
                            출력기록
                        </button>
                    </div>
                    <textarea
                        id="bible-verse"
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
                        placeholder="예: 요한복음 3:16"
                        value={verse}
                        onChange={(e) => setVerse(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-cyan-300 mb-2">
                        2. 출력 언어 선택
                    </label>
                    <select
                        id="language"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="video-length" className="block text-sm font-medium text-cyan-300 mb-2">
                        3. 영상 총 길이 (선택사항)
                    </label>
                    <input
                        id="video-length"
                        type="text"
                        inputMode="numeric"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
                        placeholder="예: 60 (초 단위)"
                        value={videoLength}
                        onChange={(e) => setVideoLength(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="cut-length" className="block text-sm font-medium text-cyan-300 mb-2">
                        4. 평균 컷 길이 (선택사항)
                    </label>
                     <input
                        id="cut-length"
                        type="text"
                        inputMode="numeric"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
                        placeholder="예: 3-5 (초 단위)"
                        value={cutLength}
                        onChange={(e) => setCutLength(e.target.value)}
                    />
                </div>
                 <div>
                    <label htmlFor="style" className="block text-sm font-medium text-cyan-300 mb-2">
                        5. 영상 비주얼 스타일
                    </label>
                    <select
                        id="style"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        {VISUAL_STYLES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor="era" className="block text-sm font-medium text-cyan-300 mb-2">
                        6. 시대적 배경 선택
                    </label>
                    <select
                        id="era"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                        value={era}
                        onChange={(e) => setEra(e.target.value)}
                    >
                        {HISTORICAL_ERAS.map((e) => (
                            <option key={e.value} value={e.value}>
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor="country" className="block text-sm font-medium text-cyan-300 mb-2">
                        7. 국가별 배경 (선택사항)
                    </label>
                    <input
                        id="country"
                        type="text"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
                        placeholder="예: 한국 전통 스타일"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="color-tone" className="block text-sm font-medium text-cyan-300 mb-2">
                        8. 창의적 색상톤 (선택사항)
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="color-tone"
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
                            placeholder="예: 세피아 톤, 차가운 새벽 공기, 황금빛 노을"
                            value={colorTone}
                            onChange={(e) => setColorTone(e.target.value)}
                        />
                        <button 
                            onClick={handleRecommendTone}
                            disabled={isRecommendingTone || !verse.trim()}
                            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            title="AI에게 색상톤 추천받기"
                        >
                            <WandIcon className="w-5 h-5" />
                            <span className="ml-2 hidden sm:inline">{isRecommendingTone ? '추천 중...' : 'AI 추천'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    title="모든 입력 초기화"
                >
                    <RefreshIcon className="w-5 h-5 mr-2" />
                    새로 시작
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isLoading ? '생성 중...' : '프롬프트 생성'}
                </button>
            </div>

            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
            
            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {generatedResult && (
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="border-b border-gray-700 flex">
                            <button 
                                onClick={() => setActiveTab('full')}
                                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${activeTab === 'full' ? 'bg-gray-700/50 text-cyan-300' : 'text-gray-400 hover:bg-gray-800/50'}`}
                            >
                                전체 프롬프트
                            </button>
                            <button 
                                onClick={() => setActiveTab('cuts')}
                                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${activeTab === 'cuts' ? 'bg-gray-700/50 text-cyan-300' : 'text-gray-400 hover:bg-gray-800/50'}`}
                            >
                                장면별 컷
                            </button>
                        </div>
                        
                        <div className="p-4">
                             {activeTab === 'full' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-cyan-300">생성된 비디오 프롬프트</h3>
                                        <button onClick={handleCopyFullPrompt} className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-md transition duration-200">
                                            <CopyIcon className="w-4 h-4 mr-2"/>
                                            {fullPromptCopySuccess ? '복사됨!' : '복사'}
                                        </button>
                                    </div>
                                     <textarea
                                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-300 font-mono text-sm leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                        value={generatedResult.fullPrompt}
                                        onChange={(e) => handleFullPromptChange(e.target.value)}
                                        rows={10}
                                    />

                                    {generatedResult.characters && generatedResult.characters.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-cyan-300 mb-3">등장인물 (수정 가능)</h3>
                                            <div className="space-y-4">
                                                {generatedResult.characters.map((character, index) => (
                                                    <div key={index} className="bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-transparent font-bold text-gray-200 focus:outline-none focus:text-cyan-400 transition-colors pr-2"
                                                                value={character.name}
                                                                onChange={(e) => handleCharacterChange('name', e.target.value, index)}
                                                            />
                                                            <button 
                                                                onClick={() => handleCopyCharacter(character, index)}
                                                                className="flex-shrink-0 flex items-center text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded-md transition duration-200"
                                                            >
                                                                <CopyIcon className="w-3 h-3 mr-1.5"/>
                                                                {copiedCharacterIndex === index ? '복사됨!' : '복사'}
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-400 whitespace-pre-wrap text-sm leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                            value={character.description}
                                                            onChange={(e) => handleCharacterChange('description', e.target.value, index)}
                                                            rows={4}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'cuts' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">장면별 컷</h3>
                                    <div className="space-y-4">
                                        {generatedResult.sceneCuts.map((cut, index) => (
                                            <div key={index} className="bg-gray-800/50 p-4 rounded-md border border-gray-600">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-200">{cut.cutNumber}</h4>
                                                    <button 
                                                        onClick={() => {
                                                            const textToCopy = `${cut.cutNumber}\n\n${cut.description}\n\nDynamic Elements:\n${cut.dynamicElements}\n\nBackground Music:\n${cut.backgroundMusic}\n\nSound Effects:\n${cut.soundEffects}\n\nNarration:\n${cut.narration}`;
                                                            handleCopyCut(textToCopy, index);
                                                        }} 
                                                        className="flex-shrink-0 flex items-center text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded-md transition duration-200"
                                                    >
                                                        <CopyIcon className="w-3 h-3 mr-1.5"/>
                                                        {copiedCutIndex === index ? '복사됨!' : '복사'}
                                                    </button>
                                                </div>
                                                <p className="text-gray-400 whitespace-pre-wrap font-mono text-xs leading-relaxed mb-3">{cut.description}</p>
                                                <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3">
                                                    <div>
                                                        <h5 className="font-semibold text-cyan-400 text-xs mb-2">동적 요소 (수정 가능)</h5>
                                                        <textarea
                                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-300 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                            value={cut.dynamicElements}
                                                            onChange={(e) => handleSceneCutChange('dynamicElements', e.target.value, index)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-cyan-400 text-xs mb-2">배경 음악 (수정 가능)</h5>
                                                        <textarea
                                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-300 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                            value={cut.backgroundMusic}
                                                            onChange={(e) => handleSceneCutChange('backgroundMusic', e.target.value, index)}
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-cyan-400 text-xs mb-2">음향 효과 (수정 가능)</h5>
                                                        <textarea
                                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-300 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                            value={cut.soundEffects}
                                                            onChange={(e) => handleSceneCutChange('soundEffects', e.target.value, index)}
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-cyan-400 text-xs mb-2">나레이션 스크립트 (수정 가능)</h5>
                                                        <textarea
                                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-300 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                            value={cut.narration}
                                                            onChange={(e) => handleSceneCutChange('narration', e.target.value, index)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

             <HistoryPanel 
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onLoad={handleLoadHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearHistory}
            />
        </div>
    );
};

export default PromptGenerator;