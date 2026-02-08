import React from 'react';
import { JAVA_GAMIFICATION, JAVA_QR_GENERATION, JAVA_SENTIMENT_LOGIC, JAVA_SLA_SCHEDULER } from '../utils/javaCodeSnippets';

const CodeBlock = ({ title, code }: { title: string, code: string }) => (
  <div className="mb-8 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700">
    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center space-x-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span className="ml-4 text-xs text-gray-400 font-mono">{title}</span>
    </div>
    <div className="p-4 overflow-x-auto">
      <pre className="text-sm font-mono text-green-400">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

const JavaSourceViewer = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">Backend Architecture (Java Spring Boot)</h1>
        <p className="text-textSecondary mt-2">
          This system is designed with a Spring Boot backend. Below are the core logical implementations 
          required by the Enterprise Complaint Management System specification.
        </p>
      </div>

      <CodeBlock title="SentimentAnalysisService.java" code={JAVA_SENTIMENT_LOGIC} />
      <CodeBlock title="SLAScheduler.java" code={JAVA_SLA_SCHEDULER} />
      <CodeBlock title="GamificationService.java" code={JAVA_GAMIFICATION} />
      <CodeBlock title="QRCodeService.java" code={JAVA_QR_GENERATION} />
    </div>
  );
};

export default JavaSourceViewer;