import React from 'react';

/**
 * ThreadConnectorSVG — Shared SVG connectors for comment threads
 * 
 * ARCHITECTURE:
 * - ChildBranch: L-shaped SVG drawn by each child to branch from parent's vertical line
 * - ParentLine: Vertical SVG line from parent avatar down through all children
 * 
 * The parent's vertical line is at x=20 (center of a 40px avatar column).
 * Each child is indented, so the branch starts at a negative x offset to reach
 * the parent's line, using overflow:visible on the SVG.
 */

// Colors matching the existing design
const LINE_COLOR = 'rgba(156,163,175,0.4)';
const LINE_COLOR_FADE = 'rgba(156,163,175,0.25)';

/**
 * ChildBranch — L-shaped SVG connector drawn by each CHILD comment (depth > 0).
 * 
 * Draws:
 * 1. A vertical line from the top (continuing from previous sibling or parent line)
 * 2. A smooth quadratic curve turning into a horizontal line toward this child's avatar
 * 3. If NOT the last child, the vertical line continues to 100% height for the next sibling
 * 
 * @param {boolean} isLast - Whether this is the last sibling (line stops at curve)
 * @param {number} indent - The horizontal distance (px) from this child's left edge to the parent's line
 */
export const ChildBranch = ({ isLast, indent = 10 }) => {
    // The parent's vertical line x-position, relative to this child's left edge
    const lineX = indent;
    // Where the curve ends (pointing at avatar center = 20px from this child's left + padding)
    // Avatar is inside p-4 (16px) + 20px center = 36px, but connector points to ~39px 
    const endX = 39;
    // Curve anchor points
    const curveStartY = 12;
    const curveEndY = 24;

    // SVG path: vertical down, smooth L-curve, horizontal to avatar
    const branchPath = `M ${lineX} 0 L ${lineX} ${curveStartY} Q ${lineX} ${curveEndY} ${lineX + 12} ${curveEndY} L ${endX} ${curveEndY}`;

    return (
        <svg
            className="absolute left-0 top-0 pointer-events-none dark:opacity-60"
            style={{ width: '42px', height: '100%' }}
            fill="none"
            overflow="visible"
        >
            {/* L-shaped branch: vertical → curve → horizontal */}
            <path
                d={branchPath}
                stroke={LINE_COLOR}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Continuation line below the curve for non-last siblings */}
            {!isLast && (
                <line
                    x1={lineX}
                    y1={curveEndY}
                    x2={lineX}
                    y2="100%"
                    stroke={LINE_COLOR_FADE}
                    strokeWidth="2"
                />
            )}
        </svg>
    );
};

/**
 * ParentLine — Vertical SVG line from parent's avatar area down through all children.
 * 
 * Placed inside the parent's OUTER wrapper (not article) so it extends through
 * both the article content and the nested replies area.
 * Uses a blue→purple gradient matching the existing design.
 * 
 * @param {string|number} commentId - Unique ID for SVG gradient reference
 * @param {number} startY - Where the line starts (below avatar), default 48px
 */
export const ParentLine = ({ commentId, startY = 48 }) => {
    const gradientId = `parent-line-${commentId}`;

    return (
        <svg
            className="absolute left-0 pointer-events-none"
            style={{
                left: '19px',
                top: `${startY}px`,
                width: '2px',
                height: `calc(100% - ${startY}px)`,
            }}
            overflow="hidden"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.5)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.35)" />
                </linearGradient>
            </defs>
            <rect
                x="0"
                y="0"
                width="2"
                height="100%"
                rx="1"
                fill={`url(#${gradientId})`}
            />
        </svg>
    );
};

export default { ChildBranch, ParentLine };
