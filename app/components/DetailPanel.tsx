'use client';

import React from 'react';
import { Node } from 'reactflow';

interface DetailPanelProps {
  node: Node;
  onClose: () => void;
}

export default function DetailPanel({ node, onClose }: DetailPanelProps) {
  const { data } = node;

  return (
    <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-auto z-10">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Node Details</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Title/Label */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-1">Title</h4>
          <p className="text-sm">{data.label || 'Untitled'}</p>
        </div>

        {/* URL */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-1">URL</h4>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {data.url}
          </a>
        </div>

        {/* Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-1">Status</h4>
          <span
            className={`inline-block px-2 py-1 rounded text-xs ${
              data.isLive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {data.isLive ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Detection Method (for subsites) */}
        {data.detectionMethod && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Detection Method
              </h4>
              <p className="text-sm uppercase">{data.detectionMethod}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Confidence
              </h4>
              <span
                className={`inline-block px-2 py-1 rounded text-xs ${
                  data.detectionConfidence === 'high'
                    ? 'bg-green-100 text-green-800'
                    : data.detectionConfidence === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {data.detectionConfidence}
              </span>
            </div>
          </>
        )}

        {/* Page Count (for subsites) */}
        {data.pageCount !== undefined && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">
              Pages Discovered
            </h4>
            <p className="text-sm">{data.pageCount}</p>
          </div>
        )}

        {/* Path (for pages) */}
        {data.path && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Path</h4>
            <p className="text-sm font-mono">{data.path}</p>
          </div>
        )}

        {/* Outbound Links (for pages) */}
        {data.outboundLinks && data.outboundLinks.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-1">
              Outbound Links ({data.outboundLinks.length})
            </h4>
            <ul className="text-sm space-y-1">
              {data.outboundLinks.map((link: string, index: number) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

