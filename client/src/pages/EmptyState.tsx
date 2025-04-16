"use client"

import React from "react"

interface ShortcutKeyProps {
    children: React.ReactNode
}

const ShortcutKey: React.FC<ShortcutKeyProps> = ({ children }) => {
    return (
        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs font-medium min-w-[1.5rem] text-center inline-block">
            {children}
        </span>
    )
}

interface ShortcutProps {
    keys: string[]
}

const KeyboardShortcut: React.FC<ShortcutProps> = ({ keys }) => {
    return (
        <div className="flex items-center gap-1.5">
            {keys.map((key, index) => (
                <React.Fragment key={index}>
                    <ShortcutKey>{key}</ShortcutKey>
                    {index < keys.length - 1 && <span className="text-gray-500">+</span>}
                </React.Fragment>
            ))}
        </div>
    )
}

interface ShortcutItemProps {
    label: string
    shortcuts: string[][]
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ label, shortcuts }) => {
    return (
        <div className="flex items-center justify-between w-full gap-4 sm:gap-8">
            <span className="text-gray-400 text-sm whitespace-nowrap">{label}</span>
            <div className="flex flex-wrap justify-end gap-2">
                {shortcuts.map((shortcut, index) => (
                    <KeyboardShortcut key={index} keys={shortcut} />
                ))}
            </div>
        </div>
    )
}

export default function EmptyState() {
    const shortcuts = [
        {
            label: "Quick Open",
            shortcuts: [["Ctrl", "P"]],
        },
        {
            label: "Open Terminal",
            shortcuts: [["Ctrl", "`"]],
        },
        {
            label: "Save File",
            shortcuts: [["Ctrl", "S"]],
        },
        {
            label: "Save File As",
            shortcuts: [
                ["Ctrl", "Shift","S"],
            ],
        },
        {
            label: "Undo",
            shortcuts: [["Ctrl", "Z"]],
        },
        {
            label: "Redo",
            shortcuts: [["Ctrl", "Y"]],
        },
        {
            label: "Cut",
            shortcuts: [["Ctrl", "X"]],
        },
        {
            label: "Copy",
            shortcuts: [["Ctrl", "C"]],
        },
        {
            label: "Paste",
            shortcuts: [["Ctrl", "V"]],
        },
        {
            label: "Explorer",
            shortcuts: [["Ctrl", "Shift", "E"]],
        },
        {
            label: "Search",
            shortcuts: [["Ctrl", "Shift", "F"]],
        },
        {
            label: "Source Control",
            shortcuts: [["Ctrl", "Shift", "G"]],
        }
    ]

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#1E1E1E] text-gray-400">
            <div className="flex flex-col space-y-5 min-w-[320px] md:min-w-[400px] max-w-[90vw] select-none">
                {shortcuts.map((shortcut, index) => (
                    <ShortcutItem key={index} label={shortcut.label} shortcuts={shortcut.shortcuts} />
                ))}
            </div>
        </div>
    )
}
