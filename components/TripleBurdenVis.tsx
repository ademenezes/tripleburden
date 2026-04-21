'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface BurdenData {
    name: string;
    color: string;
    colorLight: string;
    description: string;
    icon: string;
}

const burdens: BurdenData[] = [
    {
        name: 'Climate Risk',
        color: '#1a7f8e',
        colorLight: '#2ca3b5',
        description: 'Water stress & flood risk',
        icon: '🌊'
    },
    {
        name: 'Poverty',
        color: '#8b7355',
        colorLight: '#a89176',
        description: 'Limited economic resources',
        icon: '💰'
    },
    {
        name: 'Low Sanitation',
        color: '#1e3a5f',
        colorLight: '#2d5a8f',
        description: 'Inadequate facilities',
        icon: '🚰'
    }
];

export default function TripleBurdenVis() {
    const [isAnimating, setIsAnimating] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.3, // Trigger when 30% of component is visible
                rootMargin: '0px'
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => setShowLabels(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-12">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-bold mb-4">The Triple Burden Effect</h2>
                <p className="text-lg text-gray-600">
                    Three interconnected vulnerabilities converging into a crisis
                </p>
            </motion.div>

            {/* SVG Visualization */}
            <svg viewBox="0 0 800 600" className="w-full h-auto">
                <defs>
                    {/* Gradients for each burden */}
                    {burdens.map((burden, i) => (
                        <linearGradient
                            key={`gradient-${i}`}
                            id={`gradient-${i}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor={burden.colorLight} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={burden.color} stopOpacity="0.9" />
                        </linearGradient>
                    ))}

                    {/* Center convergence gradient */}
                    <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#1a1a1a" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
                    </radialGradient>
                </defs>

                {/* Three main circles (Venn diagram) - start separated, then merge */}
                {/* Climate Risk circle - starts from left */}
                <motion.circle
                    cx="300"
                    cy="200"
                    r="150"
                    fill={`url(#gradient-0)`}
                    initial={{ cx: 150, cy: 200, opacity: 0 }}
                    animate={isVisible ? { cx: 300, cy: 200, opacity: 0.7 } : { cx: 150, cy: 200, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                />
                {/* Poverty circle - starts from right */}
                <motion.circle
                    cx="500"
                    cy="200"
                    r="150"
                    fill={`url(#gradient-1)`}
                    initial={{ cx: 650, cy: 200, opacity: 0 }}
                    animate={isVisible ? { cx: 500, cy: 200, opacity: 0.7 } : { cx: 650, cy: 200, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                />
                {/* Low Sanitation circle - starts from bottom */}
                <motion.circle
                    cx="400"
                    cy="350"
                    r="150"
                    fill={`url(#gradient-2)`}
                    initial={{ cx: 400, cy: 500, opacity: 0 }}
                    animate={isVisible ? { cx: 400, cy: 350, opacity: 0.7 } : { cx: 400, cy: 500, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                />

                {/* Center convergence point */}
                <motion.circle
                    cx="400"
                    cy="250"
                    r="60"
                    fill="url(#centerGradient)"
                    stroke="#ffffff"
                    strokeWidth="3"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                />

                {/* Animated flow lines */}
                {isAnimating && (
                    <>
                        <motion.path
                            d="M 300 200 Q 350 220 400 250"
                            stroke={burdens[0].color}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 2 }}
                        />
                        <motion.path
                            d="M 500 200 Q 450 220 400 250"
                            stroke={burdens[1].color}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatDelay: 2 }}
                        />
                        <motion.path
                            d="M 400 350 Q 400 300 400 250"
                            stroke={burdens[2].color}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1.5, delay: 1.4, repeat: Infinity, repeatDelay: 2 }}
                        />
                    </>
                )}

                {/* Labels for each burden */}
                {showLabels && (
                    <>
                        <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 2 }}
                        >
                            <text x="300" y="120" textAnchor="middle" className="text-sm font-semibold" fill="#ffffff">
                                {burdens[0].icon} {burdens[0].name}
                            </text>
                            <text x="300" y="140" textAnchor="middle" className="text-xs" fill="#ffffff" opacity="0.9">
                                {burdens[0].description}
                            </text>
                        </motion.g>

                        <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 2.2 }}
                        >
                            <text x="500" y="120" textAnchor="middle" className="text-sm font-semibold" fill="#ffffff">
                                {burdens[1].icon} {burdens[1].name}
                            </text>
                            <text x="500" y="140" textAnchor="middle" className="text-xs" fill="#ffffff" opacity="0.9">
                                {burdens[1].description}
                            </text>
                        </motion.g>

                        <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 2.4 }}
                        >
                            <text x="400" y="450" textAnchor="middle" className="text-sm font-semibold" fill="#ffffff">
                                {burdens[2].icon} {burdens[2].name}
                            </text>
                            <text x="400" y="470" textAnchor="middle" className="text-xs" fill="#ffffff" opacity="0.9">
                                {burdens[2].description}
                            </text>
                        </motion.g>

                        {/* Center label */}
                        <motion.g
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 2.6 }}
                        >
                            <text x="400" y="245" textAnchor="middle" className="text-base font-bold" fill="#ffffff">
                                TRIPLE
                            </text>
                            <text x="400" y="265" textAnchor="middle" className="text-base font-bold" fill="#ffffff">
                                BURDEN
                            </text>
                        </motion.g>
                    </>
                )}

                {/* Intersection labels with numbers */}
                {showLabels && (
                    <>
                        {/* Two-way intersections - positioned at outer edges of lens overlaps */}
                        {/* Top intersection: Climate + Poverty (upper edge) */}
                        <motion.text
                            x="400"
                            y="180"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.8 }}
                        >
                            2
                        </motion.text>
                        {/* Bottom-right intersection: Poverty + Sanitation (right edge) */}
                        <motion.text
                            x="480"
                            y="290"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.9 }}
                        >
                            2
                        </motion.text>
                        {/* Bottom-left intersection: Climate + Sanitation (left edge) */}
                        <motion.text
                            x="320"
                            y="290"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                        >
                            2
                        </motion.text>

                        {/* Individual burdens - centered in each circle */}
                        {/* Climate Risk circle (left) */}
                        <motion.text
                            x="230"
                            y="200"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3.1 }}
                        >
                            1
                        </motion.text>
                        {/* Poverty circle (right) */}
                        <motion.text
                            x="570"
                            y="200"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3.2 }}
                        >
                            1
                        </motion.text>
                        {/* Low Sanitation circle (bottom) */}
                        <motion.text
                            x="400"
                            y="420"
                            textAnchor="middle"
                            className="text-2xl font-bold"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3.3 }}
                        >
                            1
                        </motion.text>

                        {/* Center "3" */}
                        <motion.text
                            x="400"
                            y="285"
                            textAnchor="middle"
                            className="text-3xl font-bold"
                            fill="#ffd700"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 3.5, duration: 0.5 }}
                        >
                            3
                        </motion.text>
                    </>
                )}
            </svg>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.8 }}
                className="mt-8 text-center text-sm text-gray-600"
            >
                <p className="mb-2">
                    <span className="font-semibold">1</span> = Single burden |
                    <span className="font-semibold"> 2</span> = Two burdens |
                    <span className="font-semibold text-yellow-600"> 3</span> = Triple Burden
                </p>
                <p className="italic">
                    The convergence creates a cycle of inescapable risk
                </p>
            </motion.div>
        </div>
    );
}
