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
  onAddRule: (rule: FirewallRule) => void; // callback for adding rule
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

      console.log('Add Firewall Rule:', { Uuid: selectedHost, Chain: selectedChain, ...newRule });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call parent callback to actually add rule
      onAddRule(newRule);

      toast({
        title: "Success",
        description: "Firewall rule added",
      });

      // Reset form
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
        title: "Error",
        description: "Unable to add firewall rule",
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
          <DialogTitle>Add {selectedChain} Chain Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Action</Label>
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
              <Label htmlFor="protocol">Protocol</Label>
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
              <Label htmlFor="inInterface">Input Interface</Label>
              <Input
                id="inInterface"
                value={formData.inInterface}
                onChange={(e) => handleInputChange('inInterface', e.target.value)}
                placeholder="e.g., eth0, lo (empty for any)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outInterface">Output Interface</Label>
              <Input
                id="outInterface"
                value={formData.outInterface}
                onChange={(e) => handleInputChange('outInterface', e.target.value)}
                placeholder="e.g., eth0, * (any)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source IP</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., 192.168.1.100, 0.0.0.0/0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination IP</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., 192.168.1.1, 0.0.0.0/0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="options">Target Port</Label>
            <Popover open={openPortPopover} onOpenChange={setOpenPortPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  {port || "Select Target Port"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="right" align="start">
                <Command>
                  <CommandInput placeholder="Search or input custom..." />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
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
                              placeholder="Custom Target Port"
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
              Common options: tcp dpt:22 (SSH), tcp dpt:80 (HTTP), tcp dpt:443 (HTTPS), udp dpt:53 (DNS)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button style = {{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white"
            type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
