import Logger from "#loaders/logger";
import md5 from "md5";
import { Container } from "typedi";

const sendMailChimp = async (job, done) => {
  const mailChimp = Container.get("mailChimp");

  try {
    Logger.debug("✌️ Calling mailchimp Job triggered!");

    const {
      payload: { email, listId, tags },
    } = job.attrs.data;

    const subscriberHash = md5(email.toLowerCase());

    const response = await mailChimp.lists.setListMember(
      listId,
      subscriberHash,
      {
        email_address: email,
        status_if_new: "subscribed",
      }
    );

    const existingTags = response.tags.map((tag) => tag.name);
    const allUniqueTags = [...new Set([...existingTags, ...tags])];

    const formattedTags = allUniqueTags.map((tag) => {
      return {
        name: tag,
        status: "active",
      };
    });

    const updateSubscriberTags = await mailChimp.lists.updateListMemberTags(
      listId,
      subscriberHash,
      {
        tags: formattedTags,
      }
    );

    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default sendMailChimp;
