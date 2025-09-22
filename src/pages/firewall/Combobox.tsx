"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxPortProps {
  value: string
  onChange: (val: string) => void
}

export const ComboboxPort: React.FC<ComboboxPortProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const [customValue, setCustomValue] = React.useState("")

  const ports = ["22", "80", "443", "3389", "Other"]

  const handleSelect = (val: string) => {
    if (val === "Other") {
      onChange(customValue)
    } else {
      onChange(val)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {value || "選擇目標埠"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="搜尋或輸入自訂..." />
          <CommandList>
            <CommandEmpty>沒有找到結果</CommandEmpty>
            <CommandGroup>
              {ports.map((port) => (
                <CommandItem
                  key={port}
                  value={port}
                  onSelect={() => handleSelect(port)}
                >
                  {port === "Other" ? (
                    <input
                      type="text"
                      placeholder="自訂目標埠"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="w-full border-none outline-none"
                    />
                  ) : (
                    port
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
