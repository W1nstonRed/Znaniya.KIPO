<script>
    import Tab from '$lib/ui/Tab.svelte'
    import Tabs from '$lib/ui/Tabs.svelte'
    import GroupView from '../group-view/GroupView.svelte'
    import TeacherView from '../teacher-view/TeacherView.svelte'
</script>

<div class="flex items-center justify-center">
    <Tabs>
        <Tab label="Преподаватели" value="schedule-1">
            <TeacherView />
        </Tab>
        <Tab label="Группы" value="schedule-2">
            <GroupView />
        </Tab>
    </Tabs>
</div>
