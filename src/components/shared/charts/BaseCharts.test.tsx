import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { BaseBarChart } from './BaseBarChart';
import { BasePieChart } from './BasePieChart';

// Mock recharts to simplify DOM testing and avoid JSDOM SVG rendering issues
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div className="responsive-container">{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div className="recharts-bar" />,
    XAxis: ({ dataKey }: any) => <div className="x-axis">{dataKey}</div>,
    YAxis: () => <div className="y-axis" />,
    CartesianGrid: () => <div className="grid" />,
    Tooltip: () => <div className="tooltip" />,
    Legend: () => (
        <div className="legend">
            <span>Sales</span>
            <span>Profit</span>
        </div>
    ),
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data, nameKey }: any) => (
        <div className="pie">
            {data?.map((d: any) => <span key={d[nameKey]}>{d[nameKey]}</span>)}
        </div>
    ),
    Cell: () => <div className="cell" />,
}));

describe('BaseBarChart', () => {
    const mockData = [
        { name: 'Jan', sales: 400, profit: 240 },
        { name: 'Feb', sales: 300, profit: 139 },
    ];
    const bars = [
        { dataKey: 'sales', fill: '#0ea5e9', name: 'Sales' },
        { dataKey: 'profit', fill: '#f43f5e', name: 'Profit' },
    ];

    it('renders horizontal bar chart container', () => {
        render(<BaseBarChart data={mockData} bars={bars} />);
        expect(screen.getByTestId('bar-chart')).toBeDefined();
    });

    it('shows legend labels when showLegend is true', () => {
        render(<BaseBarChart data={mockData} bars={bars} showLegend={true} />);
        expect(screen.getByText('Sales')).toBeDefined();
    });
});

describe('BasePieChart', () => {
    const mockData = [
        { name: 'Direct', value: 400, color: '#0ea5e9' },
        { name: 'Social', value: 300, color: '#f43f5e' },
    ];

    it('renders pie chart and data labels', () => {
        render(<BasePieChart data={mockData} dataKey="value" nameKey="name" />);
        expect(screen.getByTestId('pie-chart')).toBeDefined();
        expect(screen.getByText('Direct')).toBeDefined();
        expect(screen.getByText('Social')).toBeDefined();
    });
});
