"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AddRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHost: string;
  selectedChain: string;
  onAddRule: (rule: FirewallRule) => void; // 新增 callback
}

export interface FirewallRule {
  Target: string;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}

export const AddRuleDialog = ({ 
  isOpen, 
  onClose, 
  selectedHost, 
  selectedChain, 
  onAddRule 
}: AddRuleDialogProps) => {
  const [formData, setFormData] = useState({
    target: 'ACCEPT',
    protocol: 'tcp',
    inInterface: '',
    outInterface: '*',
    source: '0.0.0.0/0',
    destination: '0.0.0.0/0',
    options: ''
  });
  const [port, setPort] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHost) return;

    setIsLoading(true);
    try {
      const newRule: FirewallRule = {
        Target: formData.target,
        Protocol: formData.protocol,
        In: formData.inInterface || '*',
        Out: formData.outInterface || '*',
        Source: formData.source || '0.0.0.0/0',
        Destination: formData.destination || '0.0.0.0/0',
        Options: port || ''
      };

      console.log('新增防火牆規則:', { Uuid: selectedHost, Chain: selectedChain, ...newRule });

      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 500));

      // 呼叫父元件 callback 真正新增規則
      onAddRule(newRule);

      toast({
        title: "成功",
        description: "防火牆規則已新增",
      });

      // 重置表單
      setFormData({
        target: 'ACCEPT',
        protocol: 'tcp',
        inInterface: '',
        outInterface: '*',
        source: '0.0.0.0/0',
        destination: '0.0.0.0/0',
        options: ''
      });
      setPort('');
      setCustomPort('');
      setOpenPortPopover(false);

      onClose();
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法新增防火牆規則",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const portOptions = ["22", "80", "443", "53", "Other"];
  const [openPortPopover, setOpenPortPopover] = useState(false);
  const [customPort, setCustomPort] = useState("");

  const handleSelectPort = (value: string) => {
    if (value === "Other") {
      setPort(customPort);
    } else {
      setPort(value);
      setOpenPortPopover(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新增 {selectedChain} 鏈規則</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">動作</Label>
              <Select value={formData.target} onValueChange={(value) => handleInputChange('target', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">ACCEPT</SelectItem>
                  <SelectItem value="DROP">DROP</SelectItem>
                  <SelectItem value="REJECT">REJECT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">協定</Label>
              <Select value={formData.protocol} onValueChange={(value) => handleInputChange('protocol', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="icmp">ICMP</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inInterface">輸入介面</Label>
              <Input
                id="inInterface"
                value={formData.inInterface}
                onChange={(e) => handleInputChange('inInterface', e.target.value)}
                placeholder="例如: eth0, lo (空白為任意)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outInterface">輸出介面</Label>
              <Input
                id="outInterface"
                value={formData.outInterface}
                onChange={(e) => handleInputChange('outInterface', e.target.value)}
                placeholder="例如: eth0, * (任意)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">來源 IP</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="例如: 192.168.1.100, 0.0.0.0/0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">目的 IP</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="例如: 192.168.1.1, 0.0.0.0/0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="options">目標埠</Label>
            <Popover open={openPortPopover} onOpenChange={setOpenPortPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  {port || "選擇目標埠"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="right" align="start">
                <Command>
                  <CommandInput placeholder="搜尋或輸入自訂..." />
                  <CommandList>
                    <CommandEmpty>沒有找到結果</CommandEmpty>
                    <CommandGroup>
                      {portOptions.map((p) => (
                        <CommandItem
                          key={p}
                          value={p}
                          onSelect={() => handleSelectPort(p)}
                        >
                          {p === "Other" ? (
                            <input
                              type="text"
                              placeholder="自訂目標埠"
                              value={customPort}
                              onChange={(e) => setCustomPort(e.target.value)}
                              className="w-full border-none outline-none"
                            />
                          ) : (
                            p
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              常用選項: tcp dpt:22 (SSH), tcp dpt:80 (HTTP), tcp dpt:443 (HTTPS), udp dpt:53 (DNS)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '新增中...' : '新增規則'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
