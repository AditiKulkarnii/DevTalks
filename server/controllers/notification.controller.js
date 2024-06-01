import Notification from "../Schema/Notification.js";
import mongoose from "mongoose";

export const newNotification = (req, res) =>{
    let {user_id} = req.user;

    Notification.exists({notification_for: user_id, seen: false, user: {$ne: user_id}})
    .then(result => {
        if(result)
            return res.status(200).json({new_notification_available: true})
        else
            return res.status(200).json({new_notification_available: false})
    })
    .catch(err => {
        console.log(err.message)
        return res.status(500).json({error: err.message})
    })
}



export const allNotificationCount = (req, res) => {
    let {user_id} = req.user;

    let  {filter} = req.body;
    let findQuery = {notification_for: user_id, user: {$ne: user_id}};

    if(filter !== 'all'){
        findQuery.type = filter
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({totalDocs: count})
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })
}




export const notifications = async (req, res) => {
    try {
        const { user_id, page, filter, deletedDocCount } = req.body;

        if (!user_id) {
            console.log('No user_id provided');
            return res.status(400).json({ message: 'User ID is required' });
        }

        console.log('Received user_id:', user_id);

        let maxLimit = 5;
        let findQuery = {
            author: user_id,
            user: { $ne: user_id }
        };

        console.log('findQuery:', findQuery);

        let skipDocs = (page - 1) * maxLimit;
        if (filter !== 'all') {
            findQuery.type = filter;
        }
        if (deletedDocCount) {
            skipDocs -= deletedDocCount;
        }

        const notifications = await Notification.find(findQuery)
            .skip(skipDocs)
            .limit(maxLimit)
            .populate('blog', 'title blog_id author')
            .populate('user', 'personal_info.fullname personal_info.username personal_info.profile_img')
            .populate('comment')
            .populate('replied_on_comment', 'comment')
            .populate('reply', 'comment')
            .sort({ createdAt: -1 })
            .select('createdAt type seen reply');

        console.log('Notifications:', JSON.stringify(notifications, null, 2));

        // Filter notifications where notifications_for matches the author's _id
        const filteredNotifications = notifications.filter(notifications => notifications.notification_for === notifications.blog);
        console.log(notifications.notification_for === notifications.blog);

        console.log('Filtered notifications:', JSON.stringify(filteredNotifications, null, 2));

        // Update notifications as seen
        await Notification.updateMany(findQuery, { seen: true })
            .skip(skipDocs)
            .limit(maxLimit);

        console.log('Seen true');

        return res.status(200).json({ notifications: filteredNotifications });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
    }
};


export const notifications_new = (req, res) => {
    const user_id = req.id;
    const { page, filter, deletedDocCount } = req.body;
    const maxLimit = 4;
    let skipDocs = (page - 1) * maxLimit;

    // Query to fetch notifications for the current user's posts
    const findQuery = {
        notifications_for: user_id,
        $or: [
            { "blog.author": user_id }, // Notifications for the user's blog posts
        ]
    };

    // Apply filter if provided
    if (filter !== 'all') {
        findQuery.type = filter;
    }

    // Adjust skipDocs if there are deleted documents
    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate("blog", "title blog_id author")
        .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
        .populate("comment")
        .populate({
            path: 'replied_on_comment',
            populate: {
                path: 'commented_by',
                select: 'username'
            }
        })
        .populate({
            path: 'reply',
            populate: {
                path: 'commented_by',
                select: 'username'
            }
        })
        .sort({ createdAt: -1 })
        .select("createdAt type seen reply")
        .then(notifications => {
            // Update 'seen' status for fetched notifications
            Notification.updateMany(findQuery, { seen: true })
                .skip(skipDocs)
                .limit(maxLimit)
                .then(() => console.log('Seen true'))
                .catch(err => console.log(err));
            return res.status(200).json({ notifications });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.message });
        });
};


export const getUsersWhoLikedPost = async (req, res) => {
    try {
        const { _id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: 'Invalid blog ID' });
        }

        const notifications = await Notification.find({ blog: _id, type: 'like' }).populate({
            path: 'user',
            select: 'personal_info.username personal_info.profile_img'
        });

        if (!notifications.length) {
            return res.status(404).json({ message: 'No likes found for this blog post' });
        }

        const users = notifications.map(notification => ({
            id: notification.user._id,
            username: notification.user.personal_info.username,
            profile_img: notification.user.personal_info.profile_img
        }));

        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



