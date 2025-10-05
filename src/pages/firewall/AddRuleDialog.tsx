import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { AddRuleRequest, Target } from './types';

interface AddRuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHost: string;
  selectedChain: string;
  onAddRule: (rule: AddRuleRequest) => void;
}

export const AddRuleDialog = ({ isOpen, onClose, selectedHost, selectedChain, onAddRule }: AddRuleDialogProps) => {
  const [formData, setFormData] = useState({
    target: 'ACCEPT' as Target,
    protocol: 'tcp',
    inInterface: '',
    outInterface: '*',
    source: '0.0.0.0/0',
    destination: '0.0.0.0/0',
    options: ''
  });
  const [port, setPort] = useState('');
  const [customPort, setCustomPort] = useState('');
  const [openPortPopover, setOpenPortPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const portOptions = ["22","80","443","53","Other"];

  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHost) return;
    setIsLoading(true);

    const newRule: AddRuleRequest = {
      Uuid: selectedHost,
      Chain: selectedChain,
      Target: formData.target,
      Protocol: formData.protocol,
      In: formData.inInterface || '*',
      Out: formData.outInterface || '*',
      Source: formData.source || '0.0.0.0/0',
      Destination: formData.destination || '0.0.0.0/0',
      Options: port || ''
    };

    try {
      const res = await axios.post('/api/firewall/rule', newRule);
      if (res.data.Type === 'OK') {
        toast({ title: "Success", description: "Firewall rule added" });
        onAddRule(newRule);
        onClose();
        setFormData({ target: 'ACCEPT', protocol: 'tcp', inInterface: '', outInterface: '*', source: '0.0.0.0/0', destination: '0.0.0.0/0', options: '' });
        setPort(''); setCustomPort(''); setOpenPortPopover(false);
      } else {
        throw new Error(res.data.Message || 'Add rule failed');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || 'Unable to add rule', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleSelectPort = (value: string) => {
    if (value === "Other") setPort(customPort);
    else { setPort(value); setOpenPortPopover(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add {selectedChain} Chain Rule</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target & Protocol */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={formData.target} onValueChange={v => handleInputChange('target', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">ACCEPT</SelectItem>
                  <SelectItem value="DROP">DROP</SelectItem>
                  <SelectItem value="REJECT">REJECT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select value={formData.protocol} onValueChange={v => handleInputChange('protocol', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="icmp">ICMP</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Interfaces, Source, Destination */}
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="In Interface" value={formData.inInterface} onChange={e => handleInputChange('inInterface', e.target.value)} />
            <Input placeholder="Out Interface" value={formData.outInterface} onChange={e => handleInputChange('outInterface', e.target.value)} />
            <Input placeholder="Source" value={formData.source} onChange={e => handleInputChange('source', e.target.value)} />
            <Input placeholder="Destination" value={formData.destination} onChange={e => handleInputChange('destination', e.target.value)} />
          </div>
          {/* Port */}
          <div className="space-y-2">
            <Label>Target Port</Label>
            <Popover open={openPortPopover} onOpenChange={setOpenPortPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">{port || 'Select Target Port'}</Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search or input custom..." />
                  <CommandList>
                    <CommandEmpty>No results</CommandEmpty>
                    <CommandGroup>
                      {portOptions.map(p => (
                        <CommandItem key={p} value={p} onSelect={() => handleSelectPort(p)}>
                          {p === "Other" ? <input value={customPort} onChange={e => setCustomPort(e.target.value)} className="w-full border-none outline-none" /> : p}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor:'#7B86AA'}} className="hover:opacity-90 text-white" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Rule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
