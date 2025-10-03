import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, AlertCircle, XCircle, Clock, Check, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: open,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/notifications/${id}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/notifications/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Deleted",
        description: "Notification deleted successfully",
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterByType = (type: string) => {
    return notifications.filter(n => n.type === type && !n.isArchived);
  };

  const allNotifications = notifications.filter(n => !n.isArchived);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-destructive';
      case 'high':
        return 'border-l-4 border-l-amber-500';
      default:
        return 'border-l-4 border-l-muted';
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} ${
        !notification.isRead ? 'bg-muted/50' : 'bg-background'
      } hover-elevate cursor-pointer transition-colors`}
      onClick={() => handleNotificationClick(notification)}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getTypeIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-sm leading-tight">{notification.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.category && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {notification.category}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                markAsReadMutation.mutate(notification.id);
              }}
              data-testid={`button-mark-read-${notification.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(notification.id);
            }}
            data-testid={`button-delete-${notification.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="all" className="flex-1">
              All
              {allNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {allNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="error" className="flex-1">
              Errors
              {filterByType('error').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filterByType('error').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alert" className="flex-1">
              Alerts
              {filterByType('alert').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filterByType('alert').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminder" className="flex-1">
              Reminders
              {filterByType('reminder').length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filterByType('reminder').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96">
            <TabsContent value="all" className="p-3 space-y-2 mt-0">
              {isLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                allNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>

            <TabsContent value="error" className="p-3 space-y-2 mt-0">
              {filterByType('error').length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-sm text-muted-foreground">No errors</p>
                </div>
              ) : (
                filterByType('error').map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>

            <TabsContent value="alert" className="p-3 space-y-2 mt-0">
              {filterByType('alert').length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-sm text-muted-foreground">No alerts</p>
                </div>
              ) : (
                filterByType('alert').map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>

            <TabsContent value="reminder" className="p-3 space-y-2 mt-0">
              {filterByType('reminder').length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-sm text-muted-foreground">No reminders</p>
                </div>
              ) : (
                filterByType('reminder').map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
