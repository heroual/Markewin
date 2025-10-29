import * as docx from 'docx';

const downloadBlob = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9_ -]/gi, '').replace(/\s+/g, '_');
};

const getFormattedDate = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// --- DOCX CONTENT GENERATORS ---

const generateKeywordReportDocxContent = (data: reportTypes.KeywordReport, docx: any) => {
    const { Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, TextRun } = docx;

    const sections = [
        new Paragraph({ text: 'Keyword Analysis Summary', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        
        new Paragraph({ text: 'Customer Pain Points & Motivations', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Paragraph({ text: data.painPointsAndMotivations, spacing: { after: 200 } }),

        new Paragraph({ text: 'Trending Topics & Seasonality', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Paragraph({ text: data.trendingTopicsAndSeasonality, spacing: { after: 200 } }),
        
        new Paragraph({ text: 'Competitor Insights', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Paragraph({ text: data.competitorInsights, spacing: { after: 200 } }),

        new Paragraph({ text: 'Opportunities & Recommendations', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        ...(data.opportunitiesAndRecommendations || []).map(rec => new Paragraph({ text: rec, bullet: { level: 0 }, spacing: { after: 50 } })),
        
        new Paragraph({ text: 'Keyword Data', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
    ];

    const header = new TableRow({
        children: ['Keyword', 'Volume', 'Intent', 'Difficulty', 'CPC', 'Opportunity', 'Notes'].map(text => 
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] })
        ),
        tableHeader: true,
    });

    const rows = (data.keywords || []).map(kw => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(kw.keyword || '')] }),
            new TableCell({ children: [new Paragraph(String(kw.volume || '0'))] }),
            new TableCell({ children: [new Paragraph(kw.intent || '')] }),
            new TableCell({ children: [new Paragraph(String(kw.difficulty || '0'))] }),
            new TableCell({ children: [new Paragraph(String(kw.cpc || '0'))] }),
            new TableCell({ children: [new Paragraph(kw.opportunity || '')] }),
            new TableCell({ children: [new Paragraph(kw.notes || '')] }),
        ]
    }));

    const table = new Table({
        rows: [header, ...rows],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(table);
    return sections;
};

const generateCompetitorReportDocxContent = (data: reportTypes.FullCompetitorReport, docx: any) => {
    const { Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = docx;
    const children: any[] = [];
    
    children.push(new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    children.push(new Paragraph({ text: data.executiveSummary, spacing: { after: 200 } }));
    
    // Market Overview
    children.push(new Paragraph({ text: 'Market Overview', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'Market Size & Growth: ', bold: true }), new TextRun(data.marketOverview?.marketSizeAndGrowth || 'N/A')] }));
    children.push(new Paragraph({ text: 'Key Trends & Innovations', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    (data.marketOverview?.keyTrendsAndInnovations || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    
    // Competitor Profiles
    children.push(new Paragraph({ text: 'Competitor Profiles', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    (data.competitors || []).forEach(comp => {
        children.push(new Paragraph({ text: comp.companyName, heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph({ text: comp.description, spacing: { after: 100 } }));
    });
    
    // Comparative Analysis Table
    children.push(new Paragraph({ text: 'Comparative Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    const compNames = (data.competitors || []).map(c => c.companyName);
    const tableHeader = new TableRow({
        children: [ 'Criteria', 'Your Company', ...compNames ].map(name => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: name, bold: true })] })] })),
        tableHeader: true,
    });
    const tableRows = (data.comparativeAnalysisTable || []).map(row => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(row.criteria)] }),
            new TableCell({ children: [new Paragraph(row.yourCompany)] }),
            ...compNames.map(name => {
                const value = row.competitorValues?.find(cv => cv.companyName === name)?.value || 'N/A';
                return new TableCell({ children: [new Paragraph(value)] });
            })
        ]
    }));
    children.push(new Table({ rows: [tableHeader, ...tableRows], width: { size: 100, type: WidthType.PERCENTAGE } }));

    // SWOT
    children.push(new Paragraph({ text: 'SWOT Analysis', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    Object.entries(data.swotComparison || {}).forEach(([key, value]) => {
         children.push(new Paragraph({ text: key.charAt(0).toUpperCase() + key.slice(1), heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
         (value as string[]).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    });

    return children;
};

const generateLeadGenDocxContent = (data: reportTypes.LeadGenerationStrategyReport, docx: any) => {
    const { Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, TextRun } = docx;
    const children: any[] = [];

    children.push(new Paragraph({ text: 'Ideal Customer Profile', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));
    Object.entries(data.idealCustomerProfile).forEach(([key, value]) => {
        children.push(new Paragraph({ text: key.replace(/([A-Z])/g, ' $1').trim(), heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        (value as string[]).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    });

    children.push(new Paragraph({ text: 'Lead Sources & Magnets', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    children.push(new Paragraph({ text: 'Lead Sources', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
    (data.leadSources || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    children.push(new Paragraph({ text: 'Lead Magnets', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    (data.leadMagnets || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));

    children.push(new Paragraph({ text: 'Keyword Targeting', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    const keywordTable = new Table({
        rows: [
            new TableRow({ tableHeader: true, children: ['Keyword', 'Volume', 'CPC', 'Intent', 'Opportunity'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
            ...(data.keywordTargeting || []).map(kw => new TableRow({ children: [kw.keyword, String(kw.volume), String(kw.cpc), kw.intent, kw.opportunity].map(t => new TableCell({ children: [new Paragraph(t)] })) }))
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
    children.push(keywordTable);

    return children;
};

const generateWebsiteAnalysisDocxContent = (data: reportTypes.WebsiteAnalysisReport, docx: any) => {
    const { Paragraph, HeadingLevel, TextRun } = docx;
    const children: any[] = [];

    const createSection = (title: string, evaluation: string[], recommendations: string[]) => {
        children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
        children.push(new Paragraph({ text: 'Evaluation', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        (evaluation || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
        children.push(new Paragraph({ text: 'Recommendations', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        (recommendations || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    };

    children.push(new Paragraph({ text: 'General Overview', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    children.push(new Paragraph(data.generalOverview?.description || ''));
    
    createSection('Design & UX', data.designAndUx?.evaluation, data.designAndUx?.recommendations);
    createSection('Performance', data.performance?.evaluation, data.performance?.recommendations);
    createSection('Content Quality', data.contentQuality?.evaluation, data.contentQuality?.recommendations);
    
    children.push(new Paragraph({ text: 'Actionable Summary', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    children.push(new Paragraph({ text: '30-Day Plan', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
    (data.actionableSummary?.thirtyDayPlan || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));

    return children;
};

const generateMarketResearchDocxContent = (data: reportTypes.FullMarketResearchReport, docx: any) => {
    const { Paragraph, HeadingLevel } = docx;
    const children: any[] = [];
    children.push(new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    children.push(new Paragraph(data.executiveSummary || ''));
    
    children.push(new Paragraph({ text: 'Market Overview', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    children.push(new Paragraph({ text: 'Trends', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
    (data.marketOverview?.trends || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    
    children.push(new Paragraph({ text: 'Target Audience', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    (data.targetAudience || []).forEach(segment => {
        children.push(new Paragraph({ text: segment.segmentName, heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph(segment.demographics));
    });
    
    children.push(new Paragraph({ text: 'Key Takeaways', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    (data.keyTakeaways || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));

    return children;
};

const generateStrategyPlanDocxContent = (data: reportTypes.FullStrategyPlan, docx: any) => {
    const { Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, TextRun } = docx;
    const children: any[] = [];
    children.push(new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    children.push(new Paragraph(data.executiveSummary || ''));

    children.push(new Paragraph({ text: 'SMART Objectives', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    (data.objectives || []).forEach(obj => {
        children.push(new Paragraph({ text: obj.objective, heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph(`Time-Bound: ${obj.timeBound}`));
    });

    children.push(new Paragraph({ text: 'Action Plan', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    const actionTable = new Table({
        rows: [
            new TableRow({ tableHeader: true, children: ['Step', 'Timeline', 'Responsibility', 'KPI', 'Budget'].map(t => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })] })) }),
            ...(data.actionPlan || []).map(item => new TableRow({ children: [item.step, item.timeline, item.responsibility, item.kpi, item.budget].map(t => new TableCell({ children: [new Paragraph(t)] })) }))
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
    children.push(actionTable);

    return children;
};

const generateSocialMediaPlanDocxContent = (data: reportTypes.SocialMediaPlanResult, docx: any) => {
    const { Paragraph, HeadingLevel } = docx;
    const children: any[] = [];
    (data.plan || []).forEach(post => {
        children.push(new Paragraph({ text: `${post.day}: ${post.postTheme}`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 100 } }));
        children.push(new Paragraph({ text: `Platform: ${post.platform} at ${post.recommendedTime}`, heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        children.push(new Paragraph(post.caption));
        children.push(new Paragraph(`Hashtags: ${post.hashtags.join(', ')}`));
    });
    return children;
};

const generateEmailMarketingDocxContent = (data: { campaigns: reportTypes.FullEmailCampaignIdea[] }, docx: any) => {
    const { Paragraph, HeadingLevel } = docx;
    const children: any[] = [];
    (data.campaigns || []).forEach(campaign => {
        children.push(new Paragraph({ text: campaign.campaignTitle, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 100 } }));
        children.push(new Paragraph({ text: 'Subject Lines', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
        (campaign.subjectLines || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
        children.push(new Paragraph({ text: 'Email Body Outline', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        children.push(new Paragraph(campaign.emailBodyOutline));
    });
    return children;
};

const generateCommercialEmailDocxContent = (data: reportTypes.FullCommercialEmail, docx: any) => {
    const { Paragraph, HeadingLevel } = docx;
    const children: any[] = [];
    children.push(new Paragraph({ text: 'Subject Line Options', heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    (data.subjectLineOptions || []).forEach(item => children.push(new Paragraph({ text: item, bullet: { level: 0 } })));
    children.push(new Paragraph({ text: 'Email Body', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 100 } }));
    (data.body || '').split('\n').forEach(para => children.push(new Paragraph(para)));
    children.push(new Paragraph({ text: `CTA: ${data.callToAction}`, spacing: { before: 200 } }));
    return children;
};


// --- PDF GENERATION (Placeholder) ---
const generatePdf = async (reportType: TaskId, reportData: any, options: ExportOptions) => {
    alert("PDF export is in development. Please use the DOCX export for a fully formatted document.");
};

// --- DOCX GENERATION (Main Function) ---
const generateDocx = async (reportType: TaskId, reportData: any, options: ExportOptions) => {
    try {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, Footer, AlignmentType } = docx;

        // --- STYLING ---
        const theme = {
            light: { background: "FFFFFF", text: "1E293B", secondary: "64748B", accent: "00897B" },
            dark: { background: "1E293B", text: "F1F5F9", secondary: "94A3B8", accent: "26A69A" },
        }[options.theme];

        const docChildren: any[] = [];

        // --- TITLE PAGE ---
        docChildren.push(new Paragraph({
            children: [ new TextRun({ text: options.reportTitle, bold: true, size: 48, color: theme.accent }) ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }));
        docChildren.push(new Paragraph({
            children: [ new TextRun({ text: `Project: ${options.projectName}`, size: 28 }) ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }));
        docChildren.push(new Paragraph({
            children: [ new TextRun({ text: `Generated for: ${options.userName}`, size: 24, color: theme.secondary }) ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }));
        docChildren.push(new Paragraph({
            children: [ new TextRun({ text: getFormattedDate(), size: 24, color: theme.secondary }) ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800, before: 400 },
        }));

        // --- REPORT CONTENT ---
        let contentChildren: any[] = [];
        switch(reportType) {
            case 'keyword-research':
                contentChildren = generateKeywordReportDocxContent(reportData, docx);
                break;
            case 'competitor-benchmarking':
                contentChildren = generateCompetitorReportDocxContent(reportData, docx);
                break;
            case 'lead-generation':
                contentChildren = generateLeadGenDocxContent(reportData, docx);
                break;
            case 'website-analysis':
                contentChildren = generateWebsiteAnalysisDocxContent(reportData, docx);
                break;
            case 'market-research':
                contentChildren = generateMarketResearchDocxContent(reportData, docx);
                break;
            case 'strategy-planning':
                contentChildren = generateStrategyPlanDocxContent(reportData, docx);
                break;
            case 'social-media-planner':
                contentChildren = generateSocialMediaPlanDocxContent(reportData, docx);
                break;
            case 'email-marketing':
                contentChildren = generateEmailMarketingDocxContent(reportData, docx);
                break;
            case 'commercial-email':
                contentChildren = generateCommercialEmailDocxContent(reportData, docx);
                break;
            default:
                contentChildren.push(new Paragraph({ text: 'This report type is not yet configured for DOCX export.' }));
        }
        
        docChildren.push(...contentChildren);

        // --- DOCUMENT CREATION ---
        const doc = new Document({
            styles: {
                paragraph: { run: { font: "Inter", size: 22, color: theme.text } },
            },
            sections: [{
                properties: {
                    page: {
                        background: { color: theme.background }
                    }
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            children: [ new TextRun({ text: "Generated by Markewin AI Agent — Empowering Smart Marketing", size: 16, color: theme.secondary, italics: true }) ],
                            alignment: AlignmentType.CENTER,
                        })],
                    }),
                },
                children: docChildren,
            }],
        });

        const blob = await Packer.toBlob(doc);
        downloadBlob(blob, `${sanitizeFilename(options.reportTitle)}.docx`);

    } catch (error) {
        // The waitForLibrary function will handle its own alert.
        console.error("Error during DOCX generation:", error);
    }
};

export const exportReport = async (
    reportType: TaskId,
    reportData: any,
    format: 'pdf' | 'docx',
    options: ExportOptions
) => {
    if (format === 'pdf') {
        await generatePdf(reportType, reportData, options);
    } else {
        await generateDocx(reportType, reportData, options);
    }
};
